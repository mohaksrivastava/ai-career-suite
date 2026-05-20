import streamlit as st
import google.genai as genai
from google.genai import types
from io import BytesIO

st.set_page_config(layout="wide")

def get_api_key():
    if "sidebar_api_key" in st.session_state and st.session_state.sidebar_api_key:
        return st.session_state.sidebar_api_key
    elif "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    else:
        st.info("Please enter your Gemini API Key in the sidebar to continue.")
        st.stop()

def get_client():
    api_key = get_api_key()
    return genai.Client(api_key=api_key)

with st.sidebar:
    st.header("🔑 Authentication")
    st.text_input("Enter Gemini API Key", type="password", key="sidebar_api_key")
    st.file_uploader("Upload your CV", type=["pdf", "docx"], key="uploaded_cv")

@st.cache_resource
def upload_cv(file_buffer, mime_type):
    try:
        client = get_client()
        return client.files.upload(file=file_buffer, config=types.UploadFileConfig(mime_type=mime_type, display_name="user_cv"))
    except Exception as e:
        st.error("API Error: Verify token status.")
        st.stop()

if st.session_state.get("uploaded_cv"):
    file = st.session_state.uploaded_cv
    file_bytes = file.read()
    if file.name.endswith(".pdf"):
        mime = "application/pdf"
    elif file.name.endswith(".docx"):
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        mime = "application/octet-stream"

    cv_file = upload_cv(BytesIO(file_bytes), mime)
else:
    cv_file = None

tab1, tab2, tab3, tab4 = st.tabs(["Job Finder", "CV Customizer", "Career Next Step", "Interview Prep Kit"])

# ==========================================
# REVISED TAB 1: INTEGRATES METADATA EXTRACTION
# ==========================================
with tab1:
    st.text_input("Additional Search Modifiers (e.g. Remote India)", key="search_modifiers")
    if st.button("Launch Web Search Agent"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            try:
                client = get_client()
                search_tool = types.Tool(google_search=types.GoogleSearch())
                config = types.GenerateContentConfig(
                    tools=[search_tool],
                    temperature=1.0
                )
                modifiers = st.session_state.get("search_modifiers", "")
                
                # Updated prompt instructions to append footnote references inside the table
                prompt = (
                    f"Perform a live Google Search to identify exactly 10 open job vacancies matching the skills and experience level in the attached CV. "
                    f"Filter by modifiers: {modifiers}. "
                    f"Output a clean Markdown table with columns: Job Title | Company Name | Key Skills Requested | Expected CTC | Date of Posting | Source Citation. "
                    f"Inside the 'Source Citation' column, do not output raw links. Instead, output matching sequential citation bracket markers like [1], [2], or [3] based on where you found the listing. "
                    f"If a field like CTC or Posting Date is missing from web search snippets, leave that specific markdown cell completely blank. Do not invent filler data."
                )
                
                with st.spinner("Searching live web indexes..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt],
                        config=config
                    )
                    
                    # 1. Output your clean Markdown table
                    st.markdown(response.text)
                    
                    # 2. Extract and append un-hallucinated links programmatically right below the table
                    try:
                        chunks = response.candidates[0].grounding_metadata.grounding_chunks
                        if chunks:
                            st.markdown("---")
                            st.subheader("🔗 Verified Application Links")
                            for idx, chunk in enumerate(chunks):
                                if chunk.web and chunk.web.uri:
                                    title = chunk.web.title if chunk.web.title else f"Job Listing Source {idx+1}"
                                    st.markdown(f"**[{idx + 1}]** [{title}]({chunk.web.uri})")
                    except AttributeError:
                        pass # Squelch gracefully if no chunks metadata payload exists
                        
            except Exception as e:
                st.error("API Error: Verify token status.")

# ==========================================
# UNTOUCHED TABS: RETAINS YOUR EXACT LOGIC
# ==========================================
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
                    client = get_client()
                    prompt = f"Analyze the attached CV alongside this target job description: {jd_text}. Rephrase existing metrics, achievements, and technical experience bullets to structurally match the target vocabulary and ATS filters. CRITICAL: Do NOT invent fake jobs, skills, or false accolades. Group your suggestions chronologically by resume section so the user can copy-paste them selectively."
                    with st.spinner("Generating Blueprint..."):
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[cv_file, prompt]
                        )
                        st.markdown(response.text)
                except Exception as e:
                    st.error("API Error: Verify token status.")

with tab3:
    if st.button("Evaluate Skill Gaps & Growth Triggers"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        else:
            try:
                client = get_client()
                prompt = "Evaluate the technical profile inside this CV. Map out exactly 2 to 3 strategic high-leverage skillsets or architectural paradigms that are essential to move into the next seniority bracket. For each skill, provide: 1. Core Competency Name, 2. Market Value/Justification, 3. A concrete, open-source portfolio project blueprint they can build independently to demonstrate true proficiency."
                with st.spinner("Evaluating..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt]
                    )
                    st.markdown(response.text)
            except Exception as e:
                st.error("API Error: Verify token status.")

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
                    client = get_client()
                    prompt = f"Act as an elite interviewer. Based on the attached CV and this job target: {jd_text}, build a tailored preparation guide. Include: 1. A 3-5 item core architectural revision index, 2. 5 deep technical mock questions probing engineering systems design, and 3. 3 specialized scenario questions utilizing the STAR structural template."
                    with st.spinner("Generating Prep Kit..."):
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=[cv_file, prompt]
                        )
                        st.markdown(response.text)
                except Exception as e:
                    st.error("API Error: Verify token status.")
