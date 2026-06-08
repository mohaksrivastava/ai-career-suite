import streamlit as st
import google.genai as genai
from google.genai import types
from io import BytesIO

# Initialize page layout globally
st.set_page_config(layout="wide")

# =====================================================================
# PHASE 1: FIXED AUTHENTICATION & SINGLETON CLIENT INFRASTRUCTURE
# =====================================================================

def get_api_key():
    if "sidebar_api_key" in st.session_state and st.session_state.sidebar_api_key.strip():
        return st.session_state.sidebar_api_key.strip()
    elif "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    else:
        st.info("Please enter your Gemini API Key in the sidebar to continue.")
        st.stop()

# Rule 1: Instantiate ONE global client for the entire execution thread
api_key = get_api_key()
client = genai.Client(api_key=api_key)

# Rule 2: Accept the global client instance as an explicit parameter.
# The underscore prefix (_client_instance) tells Streamlit NOT to hash this complex object.
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

with st.sidebar:
    st.header("🔑 Authentication")
    st.text_input("Enter Gemini API Key", type="password", key="sidebar_api_key")
    st.file_uploader("Upload your CV", type=["pdf", "docx"], key="uploaded_cv")

if st.session_state.get("uploaded_cv"):
    file = st.session_state.uploaded_cv
    file_bytes = file.read()
    if file.name.endswith(".pdf"):
        mime = "application/pdf"
    elif file.name.endswith(".docx"):
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        mime = "application/octet-stream"

    # Pass the unified global client straight into the upload module
    cv_file = upload_cv(client, BytesIO(file_bytes), mime)
else:
    cv_file = None

# Create the user interface layout tabs
tab1, tab2, tab3, tab4 = st.tabs(["Job Finder", "CV Customizer", "Career Next Step", "Interview Prep Kit"])

# =====================================================================
# PHASE 2: REVISED TAB 1 - STRUCTURED DOSSIER + LINKS METADATA
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
                # Removed "client = get_client()" to prevent re-instantiation dropouts
                search_tool = types.Tool(google_search=types.GoogleSearch())
                config = types.GenerateContentConfig(
                    tools=[search_tool],
                    temperature=1.0
                )
                modifiers = st.session_state.get("search_modifiers", "")
                
                # Updated prompt to format results as clean vertical markdown dossiers instead of tables
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
                    
                    # 1. Output the clean text report
                    st.markdown(response.text)
                    
                    # 2. Extract and append un-hallucinated URL references programmatically from the metadata
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
                        pass # Squelch gracefully if grounding chunks don't exist
                        
            except Exception as e:
                st.error("API Error: Verify token status for Gemini.")

# =====================================================================
# TAB 2: CV CUSTOMIZER (STABILIZED)
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
# TAB 3: CAREER NEXT STEP (STABILIZED)
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
# TAB 4: INTERVIEW PREP KIT (STABILIZED)
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
