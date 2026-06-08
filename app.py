import streamlit as st
import google.genai as genai
from google.genai import types
from io import BytesIO
import fitz  # PyMuPDF
import docx  # python-docx

# Initialize page layout globally
st.set_page_config(layout="wide")

# =====================================================================
# PRIVACY GUARD: PDF REDACTION ENGINE (LAYOUT PRESERVED)
# =====================================================================
def redact_pdf(file_bytes, phone_str, email_str):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    phone_count = 0
    email_count = 0

    for page in doc:
        if phone_str:
            phone_instances = page.search_for(phone_str)
            for inst in phone_instances:
                page.add_redact_annot(inst, fill=(0, 0, 0))
                phone_count += 1
                
        if email_str:
            email_instances = page.search_for(email_str)
            for inst in email_instances:
                page.add_redact_annot(inst, fill=(0, 0, 0))
                email_count += 1

        page.apply_redactions()

    scrubbed_bytes = doc.write()
    doc.close()
    return scrubbed_bytes, phone_count, email_count

# =====================================================================
# PRIVACY GUARD: WORD DOCX REDACTION ENGINE (TEXT REPLACEMENT)
# =====================================================================
def redact_docx(file_bytes, phone_str, email_str):
    # Load the Word document from the in-memory binary stream
    doc = docx.Document(BytesIO(file_bytes))
    phone_count = 0
    email_count = 0

    # Helper function to safely evaluate and swap text blocks inside paragraphs
    def clean_text_block(text, search_str, replacement):
        nonlocal phone_count, email_count
        if search_str and search_str in text:
            # Count how many times it appears in this paragraph block
            occurrences = text.count(search_str)
            if replacement == "[PHONE REDACTED]":
                phone_count += occurrences
            else:
                email_count += occurrences
            return text.replace(search_str, replacement)
        return text

    # Loop through all core body text paragraphs
    for p in doc.paragraphs:
        if phone_str:
            p.text = clean_text_block(p.text, phone_str, "[PHONE REDACTED]")
        if email_str:
            p.text = clean_text_block(p.text, email_str, "[EMAIL REDACTED]")

    # Loop through tables inside the Word file to scrub grid text data
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    if phone_str:
                        p.text = clean_text_block(p.text, phone_str, "[PHONE REDACTED]")
                    if email_str:
                        p.text = clean_text_block(p.text, email_str, "[EMAIL REDACTED]")

    # Save the modified document structure back into memory bytes
    output_stream = BytesIO()
    doc.save(output_stream)
    output_stream.seek(0)
    return output_stream.read(), phone_count, email_count

# =====================================================================
# STABILIZED AUTHENTICATION INFRASTRUCTURE
# =====================================================================
def get_api_key():
    if "sidebar_api_key" in st.session_state and st.session_state.sidebar_api_key.strip():
        return st.session_state.sidebar_api_key.strip()
    elif "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    else:
        st.info("Please enter your Gemini API Key in the sidebar to continue.")
        st.stop()

api_key = get_api_key()
client = genai.Client(api_key=api_key)

@st.cache_resource
def upload_cv(_client_instance, file_buffer, mime_type):
    try:
        return _client_instance.files.upload(
            file=file_buffer, 
            config=types.UploadFileConfig(mime_type=mime_type, display_name="user_cv")
        )
    except Exception as e:
        st.error("API Error: Secure token configuration mismatch.")
        st.stop()

# Sidebar configuration layout
with st.sidebar:
    st.header("🔑 Authentication")
    st.text_input("Enter Gemini API Key", type="password", key="sidebar_api_key")
    st.file_uploader("Upload your CV", type=["pdf", "docx"], key="uploaded_cv")
    st.header("🛡️ Privacy Shield")
    st.text_input("Phone Number to Redact (Optional)", key="user_phone")
    st.text_input("Email to Redact (Optional)", key="user_email")

# =====================================================================
# MULTI-FORMAT PARSING & ROUTING HOOK
# =====================================================================
if st.session_state.get("uploaded_cv"):
    file = st.session_state.uploaded_cv
    file_bytes = file.read()
    
    phone_input = st.session_state.get("user_phone", "").strip()
    email_input = st.session_state.get("user_email", "").strip()

    # Route files dynamically into their respective scrubbing libraries
    if file.name.endswith(".pdf"):
        mime = "application/pdf"
        if phone_input or email_input:
            file_bytes, phone_redacted, email_redacted = redact_pdf(file_bytes, phone_input, email_input)
            st.sidebar.success(f"🔒 Scrubbed {phone_redacted} phone & {email_redacted} email nodes from PDF.")
            
    elif file.name.endswith(".docx"):
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if phone_input or email_input:
            file_bytes, phone_redacted, email_redacted = redact_docx(file_bytes, phone_input, email_input)
            st.sidebar.success(f"🔒 Replaced {phone_redacted} phone & {email_redacted} email keywords inside DOCX.")
    else:
        mime = "application/octet-stream"

    # Send the safe, anonymized bytes (whether PDF or Word) directly to Gemini File Server
    cv_file = upload_cv(client, BytesIO(file_bytes), mime)
else:
    cv_file = None

# Tabs declarations
tab1, tab2, tab3, tab4 = st.tabs(["Job Finder", "CV Customizer", "Career Next Step", "Interview Prep Kit"])

# =====================================================================
# TAB 1: STRUCTURED DOSSIER + LINKS METADATA
# =====================================================================
with tab1:
    st.subheader("🌐 Multi-Portal Search & Strategic Filtering Engine")
    st.markdown(
        "Scans aggregators (**Naukri, Indeed, Cutshort, Shine**) alongside core ATS directory targets "
        "(**Greenhouse, Ashby, Lever**) using live Google Search Grounding."
    )
    st.text_input("Additional Search Modifiers (e.g. Remote India)", key="search_modifiers")
    
    if st.button("Launch Web Search Agent"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            try:
                search_tool = types.Tool(google_search=types.GoogleSearch())
                config = types.GenerateContentConfig(tools=[search_tool], temperature=1.0)
                modifiers = st.session_state.get("search_modifiers", "")
                
                prompt = (
                    f"Perform a live Google Search to identify exactly 10 open job vacancies matching the skills and experience level in the attached CV. "
                    f"Crawl prominent job portals like Naukri, Indeed, and Cutshort, alongside developer board structures like Greenhouse.io, Ashby.co, and Lever.co. "
                    f"Filter by modifiers: {modifiers}.\n\n"
                    f"CRITICAL FORMAT RULES:\n"
                    f"Do NOT output a table layout. Output each identified job sequentially using clean Markdown headings ('### Job Title - Company Name'). "
                    f"Under each heading, list exactly these points:\n"
                    f"- Expected CTC (Leave blank if missing from search results)\n"
                    f"- Date of Posting (Leave blank if missing)\n"
                    f"- Key Skills Requested\n"
                    f"- A-F Scoring Matrix: Grade the job on: [1] Skill Match, [2] Tech Stack Overlap, [3] Experience/Seniority Fit. Provide a brief 1-sentence analytical reason for each grade.\n"
                    f"- Append a localized numbered bracket footnote (like [1], [2], [3]) directly next to the Job Title heading indicating where you grounded the data."
                )
                
                with st.spinner("Searching live web indexes..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt],
                        config=config
                    )
                    st.markdown(response.text)
                    
                    try:
                        chunks = response.candidates[0].grounding_metadata.grounding_chunks
                        if chunks:
                            st.markdown("---")
                            st.subheader("🔗 Verified Application Links")
                            for idx, chunk in enumerate(chunks):
                                if chunk.web and chunk.web.uri:
                                    title = chunk.web.title if chunk.web.title else f"Job Source Portal {idx+1}"
                                    st.markdown(f"**[{idx + 1}]** [{title}]({chunk.web.uri})")
                    except AttributeError:
                        pass
                        
            except Exception as e:
                st.error("API Error: Verify token status for Gemini.")

# =====================================================================
# TAB 2: CV CUSTOMIZER 
# =====================================================================
with tab2:
    st.text_area("Paste Target Job Description (JD)", height=200, key="customizer_jd")
    if st.button("Generate ATS Optimization Blueprint"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            jd_text = st.session_state.get("customizer_jd", "")
            if not jd_text.strip():
                st.warning("Please paste a target Job Description.")
            else:
                try:
                    prompt = f"Analyze the attached CV alongside this target job description: {jd_text}. Rephrase existing metrics, achievements, and technical experience bullets to structurally match the target vocabulary and ATS filters. CRITICAL: Do NOT invent fake jobs, skills, or false accolades. Group your suggestions chronologically by resume section so the user can copy-paste them selectively."
                    with st.spinner("Generating Blueprint..."):
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[cv_file, prompt]
                        )
                        st.markdown(response.text)
                except Exception as e:
                    st.error("API Error: Verify token status for Gemini.")

# =====================================================================
# TAB 3: CAREER NEXT STEP 
# =====================================================================
with tab3:
    if st.button("Evaluate Skill Gaps & Growth Triggers"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            try:
                prompt = "Evaluate the technical profile inside this CV. Map out exactly 2 to 3 strategic high-leverage skillsets or architectural paradigms that are essential to move into the next seniority bracket. For each skill, provide: 1. Core Competency Name, 2. Market Value/Justification, 3. A concrete, open-source portfolio project blueprint they can build independently to demonstrate true proficiency."
                with st.spinner("Evaluating..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt]
                    )
                    st.markdown(response.text)
            except Exception as e:
                st.error("API Error: Verify token status for Gemini.")

# =====================================================================
# TAB 4: INTERVIEW PREP KIT
# =====================================================================
with tab4:
    st.text_area("Paste Interview Job Description", height=200, key="interview_jd")
    if st.button("Generate Interview Preparation Kit"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            jd_text = st.session_state.get("interview_jd", "")
            if not jd_text.strip():
                st.warning("Please paste a target Job Description.")
            else:
                try:
                    prompt = f"Act as an elite interviewer. Based on the attached CV and this job target: {jd_text}, build a tailored preparation guide. Include: 1. A 3-5 item core architectural revision index, 2. 5 deep technical mock questions probing engineering systems design, and 3. 3 specialized scenario questions utilizing the STAR structural template."
                    with st.spinner("Generating Prep Kit..."):
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[cv_file, prompt]
                        )
                        st.markdown(response.text)
                except Exception as e:
                    st.error("API Error: Verify token status for Gemini.")
