import streamlit as st
import google.genai as genai
from google.genai import types
from io import BytesIO

# 1. Global Application Layout & Window Configurations
st.set_page_config(
    page_title="Agentic Career Operations Suite",
    page_icon="💼",
    layout="wide"
)

st.title("💼 Agentic Career Operations Suite")
st.caption("Derived from career-ops architecture — Powered by Gemini 2.5 Flash Grounding")

# 2. Token Security Isolation Setup
def get_api_key():
    if "sidebar_api_key" in st.session_state and st.session_state.sidebar_api_key:
        return st.session_state.sidebar_api_key
    elif "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    else:
        st.info("🔒 Please enter your Gemini API Key in the sidebar to initialize workspace engines.")
        st.stop()

def get_client():
    api_key = get_api_key()
    return genai.Client(api_key=api_key)

# 3. Sidebar Infrastructure (State Capture Inputs)
with st.sidebar:
    st.header("🔑 Authentication")
    st.text_input("Enter Gemini API Key", type="password", key="sidebar_api_key")
    st.file_uploader("Upload your CV", type=["pdf", "docx"], key="uploaded_cv")

# 4. Streamlit Resource Cache for File Storage
@st.cache_resource
def upload_cv(file_buffer, mime_type):
    try:
        client = get_client()
        return client.files.upload(
            file=file_buffer, 
            config=types.UploadFileConfig(mime_type=mime_type, display_name="user_cv")
        )
    except Exception as e:
        st.error("API Error: Secure token configuration mismatch.")
        st.stop()

# Handle dynamic file ingestions mapping boundaries
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

# Initialize Tab Layout System wrappers
tab1, tab2, tab3, tab4 = st.tabs(["🔍 Job Finder", "🛠️ CV Customizer", "📈 Career Next Step", "🎯 Interview Prep Kit"])

# =====================================================================
# TAB 1: JOB FINDER (UPDATED: DOSSIER CONFIG + PORTAL INTEGRATION)
# =====================================================================
with tab1:
    st.subheader("🌐 Multi-Portal Search & Strategic Filtering Engine")
    st.markdown(
        "Scans aggregators (**Naukri, Indeed, Cutshort, Shine**) alongside core ATS directory targets "
        "(**Greenhouse, Ashby, Lever**) using Google Search Grounding pipelines."
    )
    
    st.text_input("Additional Target Parameters (e.g., Remote India, FinTech, Tier 1)", key="search_modifiers")
    
    if st.button("Execute Sourcing Pipeline", type="primary"):
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
                
                # REVISED PROMPT: Enforces dossier structures & multi-tier grading matrix rules
                prompt = (
                    f"You are an aggressive recruitment sourcing agent executing an operational pipeline search. "
                    f"Perform a live Google Search tracking open job vacancies matching the exact tech stack, seniority, and skills inside the attached CV. "
                    f"Explicitly crawl job portals like Naukri, Indeed, and Cutshort, alongside corporate board pathways powered by Greenhouse.io, Ashby.co, and Lever.co. "
                    f"Filter criteria by these manual modifiers: {modifiers}.\n\n"
                    f"CRITICAL LAYOUT COMPLIANCE:\n"
                    f"Do NOT output a table layout. Instead, output up to 10 identified jobs sequentially as individual markdown blocks using '### Title - Company' headings. "
                    f"For each job section, itemize exactly:\n"
                    f"- Expected CTC (Leave cell entirely blank if not specified in search results)\n"
                    f"- Date of Posting (Leave blank if missing)\n"
                    f"- Key Skills Requested\n"
                    f"- A-F Scoring Evaluation Matrix: Evaluate and output a letter grade across 3 explicit pillars: "
                    f"[1] Role-Skill Match, [2] Tech Stack Overlap, [3] Experience/Seniority Match. Add a 1-sentence analytical reason for each metric score.\n"
                    f"- Append a localized numbered bracket footnote (e.g., [1], [2]) directly next to the Job Title heading indicating where the data was grounded.\n\n"
                    f"Strictly maintain a non-hallucinated threshold. If fields or listings are vague, do not invent parameters."
                )
                
                with st.spinner("Scallop crawling across job directories and ATS boards..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt],
                        config=config
                    )
                    
                    # 1. Output the structured Dossier report details text
                    st.markdown(response.text)
                    
                    # 2. Extract out true programmatic underlying web reference nodes securely
                    try:
                        chunks = response.candidates[0].grounding_metadata.grounding_chunks
                        if chunks:
                            st.markdown("---")
                            st.subheader("🔗 Ground-Truth Verification Links")
                            for idx, chunk in enumerate(chunks):
                                if chunk.web and chunk.web.uri:
                                    title = chunk.web.title if chunk.web.title else f"Verified Portal Record {idx+1}"
                                    st.markdown(f"**[{idx + 1}]** [{title}]({chunk.web.uri})")
                    except AttributeError:
                        pass
                        
            except Exception as e:
                st.error("API Error: Secure token configuration mismatch.")

# =====================================================================
# TAB 2: CV CUSTOMIZER (UPDATED: EXPORTER + SHARED MEMORY BINDINGS)
# =====================================================================
with tab2:
    st.subheader("🛠️ ATS Profile Optimizer")
    
    # Check if a global state variable was populated elsewhere, otherwise fallback to empty string text
    default_jd = st.session_state.get("shared_jd_text", "")
    
    # Capture target text area inputs and bind natively back to Session State memory arrays
    jd_input = st.text_area("Paste Target Job Description (JD)", value=default_jd, height=200)
    st.session_state["shared_jd_text"] = jd_input
    
    if st.button("Generate ATS Optimization Blueprint"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        elif not st.session_state["shared_jd_text"].strip():
            st.warning("Please paste a target Job Description.")
        else:
            try:
                client = get_client()
                prompt = (
                    f"Analyze the attached CV alongside this target job description: {st.session_state['shared_jd_text']}. "
                    f"Rephrase existing metrics, achievements, and technical experience bullets to structurally match the target vocabulary and ATS filters. "
                    f"CRITICAL: Do NOT invent fake jobs, skills, or false accolades. Group your suggestions chronologically by resume section so the user can copy-paste them selectively."
                )
                with st.spinner("Refactoring vocabulary structures..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt]
                    )
                    
                    customized_cv_text = response.text
                    st.markdown(customized_cv_text)
                    
                    # ADDED: Dynamic File Download button exporter
                    st.markdown("---")
                    st.download_button(
                        label="📥 Download Tailored CV Content (Markdown)",
                        data=customized_cv_text,
                        file_name="ATS_Optimized_Resume.md",
                        mime="text/markdown"
                    )
            except Exception as e:
                st.error("API Error: Secure token configuration mismatch.")

# =====================================================================
# TAB 3: CAREER NEXT STEP (UNTOUCHED CORE)
# =====================================================================
with tab3:
    st.subheader("📈 Core Progression Forecasting")
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
                st.error("API Error: Secure token configuration mismatch.")

# =====================================================================
# TAB 4: INTERVIEW PREP KIT (UPDATED: GLOBAL MEMORY AUTO-FILL)
# =====================================================================
with tab4:
    st.subheader("🎯 Contextual Interview Preparation Workspace")
    
    # Automatically extracts target JD text values saved globally inside Tab 2 state
    shared_jd = st.session_state.get("shared_jd_text", "")
    
    interview_jd_input = st.text_area("Paste Interview Job Description", value=shared_jd, height=200)
    
    if st.button("Generate Interview Preparation Kit"):
        if not cv_file:
            st.warning("Please upload a CV first.")
        elif not interview_jd_input.strip():
            st.warning("Please paste a target Job Description.")
        else:
            try:
                client = get_client()
                prompt = f"Act as an elite interviewer. Based on the attached CV and this job target: {interview_jd_input}, build a tailored preparation guide. Include: 1. A 3-5 item core architectural revision index, 2. 5 deep technical mock questions probing engineering systems design, and 3. 3 specialized scenario questions utilizing the STAR structural template."
                with st.spinner("Generating Prep Kit..."):
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[cv_file, prompt]
                    )
                    st.markdown(response.text)
            except Exception as e:
                st.error("API Error: Secure token configuration mismatch.")
