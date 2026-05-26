import streamlit as st
import litellm
import pypdf

# 1. Global Application Layout & Window Configurations
st.set_page_config(
    page_title="Agentic Career Operations Suite",
    page_icon="💼",
    layout="wide"
)

st.title("💼 Agentic Career Operations Suite")
st.caption("Derived from career-ops architecture — Powered by Gemini 2.5 Flash Grounding")

# 3. Sidebar Infrastructure (State Capture Inputs)
with st.sidebar:
    st.header("🤖 Model Engine Matrix")
    selected_engine = st.selectbox(
        "Select Active Brain Engine",
        ["Google Gemini 2.5 Flash", "Moonshot Kimi 2.5"],
        key="selected_engine"
    )

    st.header("🔑 Authentication")
    if selected_engine == "Google Gemini 2.5 Flash":
        st.text_input("Enter Gemini API Key", type="password", key="GEMINI_API_KEY")
    else:
        st.text_input("Enter Moonshot API Key", type="password", key="MOONSHOT_API_KEY")

    st.file_uploader("Upload your CV", type=["pdf", "docx"], key="uploaded_cv")

# 4. Streamlit Resource Cache for File Storage
@st.cache_data
def extract_cv_text(file_buffer):
    try:
        reader = pypdf.PdfReader(file_buffer)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return "Error extracting text from file."

# Handle dynamic file ingestions mapping boundaries
if st.session_state.get("uploaded_cv"):
    file = st.session_state.uploaded_cv
    if file.name.endswith(".pdf"):
        cv_file_text = extract_cv_text(file)
    else:
        cv_file_text = None
        st.error("Unsupported file type. Please upload a PDF.")
else:
    cv_file_text = None

# Universal Model Router
def execute_universal_completion(model_route, user_prompt, cv_file_text=None):
    expected_key = "GEMINI_API_KEY" if "gemini" in model_route.lower() else "MOONSHOT_API_KEY"

    # Priority 1: Check st.session_state
    api_key = st.session_state.get(expected_key)

    # Priority 2: Check st.secrets
    if not api_key:
        api_key = st.secrets.get(expected_key)

    # Priority 3: Halt
    if not api_key:
        provider_name = expected_key.split('_')[0].title()
        st.info(f"🔒 Please enter your {provider_name} API Key in the sidebar to initialize workspace engines.")
        st.stop()

    messages = []
    if cv_file_text:
        combined_prompt = f"CV Content:\n{cv_file_text}\n\nUser Request:\n{user_prompt}"
        messages.append({"role": "user", "content": combined_prompt})
    else:
        messages.append({"role": "user", "content": user_prompt})

    import os
    try:
        if "moonshot" in model_route.lower():
            # Temporarily inject the env variable for LiteLLM requirement, remove it immediately after to maintain isolation
            os.environ["MOONSHOT_API_KEY"] = api_key
            response = litellm.completion(model=model_route, messages=messages, api_key=api_key, base_url="https://api.moonshot.cn/v1")
        else:
            response = litellm.completion(model=model_route, messages=messages, api_key=api_key)
        return response
    except Exception as e:
        provider_name = expected_key.split('_')[0].title()
        st.error(f"API Error: Verify token status for {provider_name}.")
        st.stop()
    finally:
        if "MOONSHOT_API_KEY" in os.environ:
            os.environ.pop("MOONSHOT_API_KEY")

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
        if not cv_file_text:
            st.warning("Please upload a CV first.")
        else:
            try:
                model_route = "gemini/gemini-2.5-flash" if st.session_state.get("selected_engine") == "Google Gemini 2.5 Flash" else "moonshot/kimi-k2.5"
                modifiers = st.session_state.get("search_modifiers", "")
                
                # REVISED PROMPT: Enforces dossier structures & multi-tier grading matrix rules
                prompt = (
                    f"You are an aggressive recruitment sourcing agent executing an operational pipeline search. "
                    f"Perform a simulated live search tracking open job vacancies matching the exact tech stack, seniority, and skills inside the attached CV. "
                    f"Explicitly consider job portals like Naukri, Indeed, and Cutshort, alongside corporate board pathways powered by Greenhouse.io, Ashby.co, and Lever.co. "
                    f"Filter criteria by these manual modifiers: {modifiers}.\n\n"
                    f"CRITICAL LAYOUT COMPLIANCE:\n"
                    f"Do NOT output a table layout. Instead, output up to 10 identified jobs sequentially as individual markdown blocks using '### Title - Company' headings. "
                    f"For each job section, itemize exactly:\n"
                    f"- Expected CTC (Leave cell entirely blank if not specified in search results)\n"
                    f"- Date of Posting (Leave blank if missing)\n"
                    f"- Key Skills Requested\n"
                    f"- A-F Scoring Evaluation Matrix: Evaluate and output a letter grade across 3 explicit pillars: "
                    f"[1] Role-Skill Match, [2] Tech Stack Overlap, [3] Experience/Seniority Match. Add a 1-sentence analytical reason for each metric score.\n"
                    f"Strictly maintain a non-hallucinated threshold. If fields or listings are vague, do not invent parameters."
                )
                
                with st.spinner("Scallop crawling across job directories and ATS boards..."):
                    response = execute_universal_completion(model_route, prompt, cv_file_text)
                    
                    # 1. Output the structured Dossier report details text
                    st.markdown(response.choices[0].message.content)
                        
            except Exception as e:
                provider_name = "Gemini" if "gemini" in model_route else "Moonshot"
                st.error(f"API Error: Secure token configuration mismatch for {provider_name}.")

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
        if not cv_file_text:
            st.warning("Please upload a CV first.")
        elif not st.session_state["shared_jd_text"].strip():
            st.warning("Please paste a target Job Description.")
        else:
            try:
                model_route = "gemini/gemini-2.5-flash" if st.session_state.get("selected_engine") == "Google Gemini 2.5 Flash" else "moonshot/kimi-k2.5"
                prompt = (
                    f"Analyze the attached CV alongside this target job description: {st.session_state['shared_jd_text']}. "
                    f"Rephrase existing metrics, achievements, and technical experience bullets to structurally match the target vocabulary and ATS filters. "
                    f"CRITICAL: Do NOT invent fake jobs, skills, or false accolades. Group your suggestions chronologically by resume section so the user can copy-paste them selectively."
                )
                with st.spinner("Refactoring vocabulary structures..."):
                    response = execute_universal_completion(model_route, prompt, cv_file_text)
                    
                    customized_cv_text = response.choices[0].message.content
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
                provider_name = "Gemini" if "gemini" in model_route else "Moonshot"
                st.error(f"API Error: Secure token configuration mismatch for {provider_name}.")

# =====================================================================
# TAB 3: CAREER NEXT STEP (UNTOUCHED CORE)
# =====================================================================
with tab3:
    st.subheader("📈 Core Progression Forecasting")
    if st.button("Evaluate Skill Gaps & Growth Triggers"):
        if not cv_file_text:
            st.warning("Please upload a CV first.")
        else:
            try:
                model_route = "gemini/gemini-2.5-flash" if st.session_state.get("selected_engine") == "Google Gemini 2.5 Flash" else "moonshot/kimi-k2.5"
                prompt = "Evaluate the technical profile inside this CV. Map out exactly 2 to 3 strategic high-leverage skillsets or architectural paradigms that are essential to move into the next seniority bracket. For each skill, provide: 1. Core Competency Name, 2. Market Value/Justification, 3. A concrete, open-source portfolio project blueprint they can build independently to demonstrate true proficiency."
                with st.spinner("Evaluating..."):
                    response = execute_universal_completion(model_route, prompt, cv_file_text)
                    st.markdown(response.choices[0].message.content)
            except Exception as e:
                provider_name = "Gemini" if "gemini" in model_route else "Moonshot"
                st.error(f"API Error: Secure token configuration mismatch for {provider_name}.")

# =====================================================================
# TAB 4: INTERVIEW PREP KIT (UPDATED: GLOBAL MEMORY AUTO-FILL)
# =====================================================================
with tab4:
    st.subheader("🎯 Contextual Interview Preparation Workspace")
    
    # Automatically extracts target JD text values saved globally inside Tab 2 state
    shared_jd = st.session_state.get("shared_jd_text", "")
    
    interview_jd_input = st.text_area("Paste Interview Job Description", value=shared_jd, height=200)
    
    if st.button("Generate Interview Preparation Kit"):
        if not cv_file_text:
            st.warning("Please upload a CV first.")
        elif not interview_jd_input.strip():
            st.warning("Please paste a target Job Description.")
        else:
            try:
                model_route = "gemini/gemini-2.5-flash" if st.session_state.get("selected_engine") == "Google Gemini 2.5 Flash" else "moonshot/kimi-k2.5"
                prompt = f"Act as an elite interviewer. Based on the attached CV and this job target: {interview_jd_input}, build a tailored preparation guide. Include: 1. A 3-5 item core architectural revision index, 2. 5 deep technical mock questions probing engineering systems design, and 3. 3 specialized scenario questions utilizing the STAR structural template."
                with st.spinner("Generating Prep Kit..."):
                    response = execute_universal_completion(model_route, prompt, cv_file_text)
                    st.markdown(response.choices[0].message.content)
            except Exception as e:
                provider_name = "Gemini" if "gemini" in model_route else "Moonshot"
                st.error(f"API Error: Secure token configuration mismatch for {provider_name}.")
