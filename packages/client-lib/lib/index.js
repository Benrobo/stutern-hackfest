window.addEventListener("DOMContentLoaded", async () => {
  await init();
});


const API_URL = "http://localhost:3000/api/";

async function init() {
  injectThirdPartyScript();
  await injectCss();
  await sleep(1000);

  const swissai_chat_id = _getChatId();

  const isChatIdValid = await checkChatValidity(swissai_chat_id); // a function

  if (!isChatIdValid) {
    throw new Error("Invalid chat id");
  } else {
    injectChatBubble();
    injectMainChatContainer();
  }

  // toast notification lib
  const notyf = new Notyf({
    duration: 5000,
    position: {
      x: "right",
      y: "top",
    },
  });

  const bubble = document.querySelector(".swissai-chat-activator-btn");
  const chatContainer = document.querySelector(".swissai-chat-container");
  const closePopup = document.querySelector("#close-popup");
  const chatInput = document.querySelector(".swissai-chat-control-input");
  const swissChatTitle = document.querySelector(".swissai-title");
  const chatSubmit = document.querySelector(".swissai-chat-control-send");
  const allFeatures = document.querySelectorAll(".swissai-feature-btn");
  const sendEscallationBtn = document.querySelector(
    ".swissai-escallation-btn.continue "
  );
  const closeEscalBtn = document.querySelector(
    ".swissai-escallation-btn.cancel"
  );
  const closeUserInfoBtn = document.querySelector(
    ".swissai-userinfo-close-btn"
  );
  const sendUserInfoBtn = document.querySelector(".swissai-userinfo-btn");

  // userinfo and escallation input fields
  const escallationInputs = document.querySelectorAll(".escallation-form input");
  const userInfoEmailInput = document.querySelector(".userinfo-form input");

  // set chat title
  swissChatTitle.innerHTML = localStorage.getItem("@swissai-chat-name") ?? "Swiss AI Chat";


  // states
  let conversations = [];
  let escallationInputData = {
    name: "",
    email: ""
  }
  let userInfoInputData = {
    email: ""
  }

  // events
  bubble.onclick = () => chatContainer.classList.toggle("visible");
  allFeatures.forEach((feature) => {
    feature.onclick = () => {
      const featureName = feature.getAttribute("name");
      if (featureName === "user-info") {
        const userInfoCont = document.querySelector(".swissai-userinfo-cont");
        userInfoCont.classList.add("visible");
      } else if (featureName === "human-support") {
        const escallationCont = document.querySelector(
          ".swissai-chat-escallation-cont"
        );
        escallationCont.classList.add("visible");
      }
    };
  })

  closePopup.onclick = () => chatContainer.classList.remove("visible");

  // user info & escallation modal events
  const hideUserInfoModal = ()=>{
    const userInfoCont = document.querySelector(".swissai-userinfo-cont");
    userInfoCont.classList.remove("visible");
  }
  const hideEscallationModal = ()=>{
    const escallationCont = document.querySelector(
      ".swissai-chat-escallation-cont"
    );
    escallationCont.classList.remove("visible");
  }

  sendEscallationBtn.onclick = async () => {
    // handle sending of escallation
    if(escallationInputData.name.length === 0){
      notyf.error("Please enter your name");
      return;
    }
    if(escallationInputData.email.length === 0){
      notyf.error("Please enter your email address");
      return;
    }
    await escallateChat(escallationInputData.email, escallationInputData.name, notyf, hideEscallationModal);
  };
  closeEscalBtn.onclick = () => hideEscallationModal();
  
  closeUserInfoBtn.onclick = () => hideUserInfoModal();
  sendUserInfoBtn.onclick = async () => {
    if(userInfoInputData.email.length === 0){
      notyf.error("Please enter your email address");
      return;
    }
    await collectUserInfo(userInfoInputData.email, notyf, hideUserInfoModal);
  }

  // update escallation  / userinfo input data
  escallationInputs.forEach((input)=>{
    input.onkeyup = (e)=>{
      const value = e.target.value;
      const name = e.target.getAttribute("name");
      escallationInputData[name] = value;
    }
  })
  userInfoEmailInput.onkeyup = (e)=> userInfoInputData["email"] =  e.target.value;

  // check if user info has been collected, disable it every 1ms
  setInterval(()=>{
    disableCollectingUserInfo();
  },1000);

  // fetch conversations every 3ms
  setInterval(async ()=>{
    const conv_id = localStorage.getItem("@swissai-conversation-id") ?? null;
    if(conv_id){
      // const conv = await fetchConversations(conv_id);
      // appendChatMessages(conv);
    }
  },5000)



  // storage
  const conversation_id =
    localStorage.getItem("@swissai-conversation-id") ?? null;

  if (conversation_id) {
    const conv = await fetchConversations(conversation_id);
    conversations = conv;
    appendChatMessages(conversations);
  }

  // handle user message submission
  chatInput.onkeyup = async (e) => {
    const value = e.target.value;
    if (e.key === "Enter") {
      handleElementLoadingState(true, false, false);
      const anonymousId = localStorage.getItem("@swissai-anonymous-id") ?? null;
      const resp = await sendAnonymousMsg(value, anonymousId, swissai_chat_id);
      if (resp.success) {
        chatInput.value = "";
        const data = resp.data;
        const { conversation_id, anonymous_id } = data;
        localStorage.setItem("@swissai-conversation-id", conversation_id);
        localStorage.setItem("@swissai-anonymous-id", anonymous_id);

        // fetch conversations
        const conv = await fetchConversations(conversation_id);
        conversations = conv;
        // append messages
        appendChatMessages(conv);

        // get ai response
        await requestAIResponse(conversation_id, notyf);
        scrollToBottom();
      } else {
        notyf.error(resp.errMsg);
        handleElementLoadingState(false, false, false);
      }
    }
  };
}

async function fetchConversations(conversation_id) {
  try {
    const req = await fetch(
      `${API_URL}chat/conversations/messages/${conversation_id}`
    );
    const res = await req.json();
    const data = res.data;
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function sendAnonymousMsg(message, anonymous_id, chatId) {
  let response = { success: false, errMsg: null, data: null };
  try {
    const payload = { message, chatId };

    if (anonymous_id && anonymous_id.length > 0) {
      payload["anonymous_id"] = anonymous_id;
    }

    const req = await fetch(`${API_URL}chat/conversations/anonymous`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = await req.json();

    console.log(res)

    if (![201, 200].includes(res.statusCode)) {
      response.errMsg = res.message ?? "Something went wrong! ";
      return response;
    }
    response.success = true;
    response.data = res.data;
    return response;
  } catch (err) {
    console.log(err);
    response.errMsg = err.message ?? "Something went wrong";
    return response;
  }
}

async function requestAIResponse(conversation_id, notyf) {
  try {
    handleElementLoadingState(true, false, true);
    scrollToBottom();

    const payload = { conversation_id };
    const req = await fetch(`${API_URL}chat/conversations/assistant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = await req.json();

    handleElementLoadingState(false, false, false);

    if (![201, 200].includes(res.statusCode)) {
      notyf.error(res.message ?? "Something went wrong! ");
      return;
    }
    
    // refetch conversations
    const conv = await fetchConversations(conversation_id);
    appendChatMessages(conv);
    scrollToBottom();

  } catch (err) {
    console.log(err);
    notyf.error(err.message ?? "Something went wrong");
    handleElementLoadingState(false, false, false);
  }
}

async function collectUserInfo(email, notyf, closeModal) {
  try {
    let convId = localStorage.getItem("@swissai-conversation-id") ?? null;
    let payload = {
      email,
      conversation_id: convId,
    };
    
    handleElementLoadingState(true);
    const req = await fetch(`${API_URL}chat/conversations/anonymous`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const resp = await req.json();

    handleElementLoadingState(false);

    if(![200, 201].includes(resp?.statusCode)){
      notyf.error(resp?.message);
      return;
    }

    notyf.success(`Successfull.`)
    closeModal();

    localStorage.setItem("@swissai-info-collected", true);

  } catch (err) {
    handleElementLoadingState(false);
    notyf.error(resp?.message);
  }
}

async function escallateChat(email, name, notyf, closeModal) {
  try {
    let chatId = _getChatId();
    let payload = {
      email,
      name,
      chatId,
    };

    handleElementLoadingState(true);
    const req = await fetch(`${API_URL}chat/conversations/escallate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const resp = await req.json();

    handleElementLoadingState(false);

    if (![200, 201].includes(resp?.statusCode)) {
      notyf.error(resp?.message);
      return;
    }

    notyf.success(resp?.message)
    closeModal();

    localStorage.setItem("@swissai-info-collected", true);
  } catch (err) {
    handleElementLoadingState(false);
    notyf.error(err?.message);
  }
}

async function checkChatValidity(chat_id){
  try {
    const req = await fetch(`${API_URL}chat/valid/${chat_id}`);
    const res = await req.json();

    if (![201, 200].includes(res.statusCode)) {
      return false;
    }
    const data = res.data;
    const chatName = data.name;

    localStorage.setItem("@swissai-chat-name", chatName);
    return true;
  } catch (err) {
    console.log(err);
    return false
  }
}

function _getChatId(){
  const scripts = document.querySelectorAll('script[data-swissai]');
  const chatId = scripts[scripts.length - 1].dataset["swissai"];
  return chatId;
}

function injectMainChatContainer() {
  const chatContainer = `
    <div class="swissai-chat-container">
      <!-- head -->
      <div class="swissai-chat-header">
        <div class="swissai-chat-header-title">
          <h3 class="swissai-title">Swiss AI Chat</h3>
        </div>
        <button id="close-popup" class="swissai-chat-header-close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- chat body -->
      <div class="swissai-chat-body">
        <!-- modal loader -->
        <div class="swissai-modal-loader">
          <div class="swissai-spinner"></div>
        </div>

        <!-- chat messages -->

        
      </div>

      <div class="swissai-chat-features">
        <button class="swissai-feature-btn swissai-user-details" name="user-info">
          👋 enter your info
        </button>
        <button class="swissai-feature-btn swissai-request-" name="human-support">
          🔔 Requests human support
        </button>
      </div>

      <!-- chat escallation modal -->
      <div class="swissai-chat-escallation-cont">
        <div class="escallation-head">
            🔔
            <h2>Are you sure you want to escalate the chat to human support?</h2>
            <p>Our support team will get back to you as soon as they can via email.</p>
        </div>
        <div class="escallation-form">
            <input type="text" name="name" class="input" placeholder="Enter your name" />
            <input type="text" name="email" class="input" placeholder="Enter your email address" />
            <button class="swissai-escallation-btn continue">Yes, Continue</button>
            <button class="swissai-escallation-btn cancel">No, Thanks</button>
        </div>
      </div>

      <!-- user info modal -->
      <div class="swissai-userinfo-cont">
        <div class="userinfo-head">
            <h2>Let us know how to contact you</h2>
        </div>
        <div class="userinfo-form">
            <input type="text" class="input" placeholder="Enter your email address" />
            <button class="swissai-userinfo-btn">Send</button>
            <button class="swissai-userinfo-close-btn close">Close</button>
        </div>
      </div>
      
      <!-- chat control input -->
      <div class="swissai-chat-control">
        <input
          type="text"
          class="swissai-chat-control-input"
          placeholder="Type your message here..."
        />
        <button class="swissai-chat-control-send">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-send"
          >
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9 22 2z" />
          </svg>
        </button>
      </div>
    </div>
  `;
  const chatContainerElement = document.createElement("div");
  chatContainerElement.innerHTML = chatContainer;
  document.body.appendChild(chatContainerElement);
}

async function injectCss(){
  // inject css inside the head style tag
  // const style = document.createElement("style");
  // style.innerHTML = await returnCss();
  // document.head.appendChild(style);

  return `
    /* @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap'); */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');

.swissai-chat-container {
    width: 400px;
    height: auto;
    position: fixed;
    bottom: 5em;
    right: 10px;
    z-index: 9999;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    font-family: 'Poppins', sans-serif;
    transform: scale(0);
    transform-origin: bottom right;
}

.swissai-chat-container.visible{
    transform-origin: bottom right;
    transition: all 0.3s ease-in-out;
    transform: scale(1);
}

.swissai-chat-container .swissai-chat-header{
    width: 100%;
    height: 60px;
    background-color: #3B82F6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #eee;
}

.swissai-chat-container .swissai-chat-header .swissai-chat-header-title{
    font-size: 18px;
    font-weight: 900;
    color: #fff;
}

.swissai-chat-container .swissai-chat-header .swissai-chat-header-close{
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    outline: none;
    border: none;
    color: #fff;
}

/* swissai chat body */
.swissai-chat-container .swissai-chat-body{
    width: 100%;
    height: 400px;
    max-height: 400px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 10px;
    box-sizing: border-box;
    overflow-y: auto;
    position: relative;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont{
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 0;
    box-sizing: border-box;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user{
    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-items: center;
    gap: 5px;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user .swissai-chat-body-user-message-container{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user .swissai-chat-body-user-message-container .swissai-chat-body-user-message{
    width: auto;
    max-width: 300px;
    background-color: #3B82F6;
    border-radius: 10px 0 10px 10px;
    padding: 2px 20px;
    box-sizing: border-box;
    color: #fff;
    font-size: 12px;
    font-weight: 300;
    font-family: 'Poppins', sans-serif;
    word-wrap: break-word;
}

/* swissai-chat-message-timestamp */
.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user .swissai-chat-body-user-message-container .swissai-chat-message-timestamp{
    width: 100%;
    max-width: 300px;
    display: flex;
    align-items: flex-start;
    justify-items: flex-start;
    box-sizing: border-box;
    font-size: 10px;
    color: #999;
    font-weight: 100;
    font-family: 'Poppins', sans-serif;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user .swissai-chat-body-user-message-container .swissai-chat-message-metadata{
    width: 100%;
    max-width: 300px;
    display: flex;
    align-items: flex-start;
    justify-items: flex-start;
    box-sizing: border-box;
    font-size: 10px;
    color: #999;
    font-weight: 100;
    font-family: 'Poppins', sans-serif;
}


/* swissai-chat-message-user-avatar */
.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-user .swissai-chat-avatar{
    border-radius: 50%;
    background-color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    padding: 2px;
    color: #fff;
    overflow: hidden;
}

/* AI MESSAGES */
.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai{
    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-items: center;
    gap: 5px;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-body-ai-message-container{
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-body-ai-message-container .swissai-chat-body-ai-message{
    width: 100%;
    max-width: 300px;
    background-color: #eee;
    border-radius: 0 10px 10px 10px;
    padding: 2px 20px;
    box-sizing: border-box;
    color: #333;
    font-size: 12px;
    font-weight: 300;
    font-family: 'Poppins', sans-serif;
    word-wrap: break-word;
}

/* swissai-chat-message-timestamp */
.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-body-ai-message-container .swissai-chat-message-timestamp{
    width: 100%;
    max-width: 300px;
    display: flex;
    align-items: flex-start;
    justify-items: flex-start;
    box-sizing: border-box;
    font-size: 10px;
    color: #999;
    font-weight: 100;
    font-family: 'Poppins', sans-serif;
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-body-ai-message-container .swiss-chat-message-metadata{
    width: 100%;
    max-width: 300px;
    display: flex;
    align-items: flex-start;
    justify-items: flex-start;
    box-sizing: border-box;
    font-size: 10px;
    color: #999;
    font-weight: 100;
    font-family: 'Poppins', sans-serif;
}

.swissai-metadata-link{
    font-size: 10px;
    color: #777;
    padding: 2px 5px;
    background: #eee;
    border-radius: 10px;
}

/* swissai-chat-message-user-avatar */
.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-avatar{
    border-radius: 50%;
    background-color: #3B82F6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    padding: 4px 4px;
    color: #fff;
    overflow: hidden;
    transform: scale(.95);
}

.swissai-chat-container .swissai-chat-body .swissai-chat-message-cont .swissai-chat-body-ai .swissai-chat-admin-avatar{
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
}



/* chat control input */
.swissai-chat-container .swissai-chat-control{
    width: 100%;
    height: 100px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    border-top: 1px solid #eee;
}

.swissai-chat-container .swissai-chat-control .swissai-chat-control-input{
    width: 100%;
    height: 40px;
    border-radius: 20px;
    border: 1px solid #eee;
    padding: 0 20px;
    box-sizing: border-box;
    outline: none;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    font-family: 'Poppins', sans-serif;
}

.swissai-chat-container .swissai-chat-control .swissai-chat-control-input:focus{
    border: 1px solid #3B82F6;
}

.swissai-chat-container .swissai-chat-control .swissai-chat-control-input.disabled{
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.4;
}

.swissai-chat-container .swissai-chat-control .swissai-chat-control-send{
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    outline: none;
    border: none;
    color: #000;
}

/* SwissAI feature */
.swissai-chat-container .swissai-chat-features{
    width: 100%;
    height: auto;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content:flex-start;
    padding: 4px 10px;
    gap: 10px;
    box-sizing: border-box;
    border-top: 1px solid #eee;
}

.swissai-chat-container .swissai-chat-features .swissai-feature-btn{
    width: auto;
    height: 30px;
    border-radius: 10px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    border: 1px solid #eee;
    color: #000;
}

.swissai-chat-container .swissai-chat-features .swissai-feature-btn:hover{
    background-color: #eee;
}

.swissai-chat-container .swissai-chat-features .swissai-feature-btn.disabled{
    background-color: #eee;
    cursor: not-allowed;
    opacity: 0.5;
}


/* chat activator btn */
.swissai-chat-activator-btn{
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #3B82F6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    outline: none;
    border: none;
    color: #fff;
}

.swissai-chat-activator-btn:hover{
    background-color: #2563EB;
}

.swissai-chat-activator-btn:focus{
    outline: none;
}

/* Modal Loader */
.swissai-modal-loader{
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    display: none;
    backdrop-filter: blur(5px);
}

.swissai-modal-loader.visible {
    display: flex;
    align-items: center;
    justify-content: center;
}



/* modal loader spinner */
.swissai-modal-loader .swissai-spinner{
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 5px solid transparent;
    border-top: 5px solid #85f3ff;
    animation: spin .5s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* AI Loading state */
.swissai-ai-loading-cont {
    display: none;
    margin-top: 20px;
}

.swissai-ai-loading-cont.visible{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.swissai-ai-loading-cont .swissai-chat-avatar{
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background-color: #3B82F6;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    padding: 2px 3px;
    color: #fff;
    overflow: hidden;
}

.swissai-loader {
  position: relative;
  left: -9999px;
  width: 8px;
  height: 8px;
  border-radius: 5px;
  background-color: #ccc;
  color: #ccc;
  box-shadow: 9999px 0 0 0 #777;
  animation: swissai-loader 1s infinite linear;
  animation-delay: 0.1s;
}
.swissai-loader::before, .swissai-loader::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
}
.swissai-loader::before {
  width: 8px;
  height: 8px;
  border-radius: 5px;
  background-color: #ccc;
  color: #ccc;
  animation: swissai-loader-before 1s infinite linear;
  animation-delay: 0s;
}
.swissai-loader::after {
  width: 8px;
  height: 8px;
  border-radius: 5px;
  background-color: #ccc;
  color: #ccc;
  animation: swissai-loader-after 1s infinite linear;
  animation-delay: 0.2s;
}

@keyframes swissai-loader {
  0% {
    box-shadow: 9999px -15px 0 0 rgba(152, 128, 255, 0);
  }
  25%, 50%, 75% {
    box-shadow: 9999px 0 0 0 #ccc;
  }
  100% {
    box-shadow: 9999px 15px 0 0 rgba(152, 128, 255, 0);
  }
}
@keyframes swissai-loader-before {
  0% {
    box-shadow: 9984px -15px 0 0 rgba(152, 128, 255, 0);
  }
  25%, 50%, 75% {
    box-shadow: 9984px 0 0 0 #ccc;
  }
  100% {
    box-shadow: 9984px 15px 0 0 rgba(152, 128, 255, 0);
  }
}
@keyframes swissai-loader-after {
  0% {
    box-shadow: 10014px -15px 0 0 rgba(152, 128, 255, 0);
  }
  25%, 50%, 75% {
    box-shadow: 10014px 0 0 0 #ccc;
  }
  100% {
    box-shadow: 10014px 15px 0 0 rgba(152, 128, 255, 0);
  }
}


/* Empty message */
.swissai-chat-empty-message{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
}

.swissai-chat-empty-message .swissai-chat-empty-message-text{
    font-size: 12px;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
}

/* chat escallation */
.swissai-chat-escallation-cont{
    width: 100%;
    height: 100%;
    background-color:#fff;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    display: none;
    backdrop-filter: blur(5px);
    padding: 5px 15px;
    word-wrap: break-word;
    box-sizing: border-box;
}

.swissai-chat-escallation-cont.visible {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.swissai-chat-escallation-cont .escallation-head{
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    text-align: center;
}

.swissai-chat-escallation-cont .escallation-head h2{
    font-size: 15px;
}

.swissai-chat-escallation-cont .escallation-head p{
    font-size: 12px;
    color: #777;
}

.swissai-chat-escallation-cont .escallation-form{
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    text-align: center;
    margin-top: 20px;
}

.swissai-chat-escallation-cont .escallation-form .input{
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #eee;
    padding: 0 20px;
    box-sizing: border-box;
    outline: none;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    font-family: 'Poppins', sans-serif;
    margin: 10px;
}

.swissai-chat-escallation-cont .escallation-form button {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #eee;
    padding: 0 20px;
    box-sizing: border-box;
    outline: none;
    font-size: 13px;
    font-weight: 500;
    color: #000;
    font-family: 'Poppins', sans-serif;
    margin: 10px;
    background-color: #eee;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.swissai-chat-escallation-cont .escallation-form button:hover{
    background-color: #ddd;
}

.swissai-chat-escallation-cont .escallation-form button.continue{
    background-color: #3B82F6;
    color: #fff;
}

.swissai-chat-escallation-cont .escallation-form button.continue:hover{
    background-color: #2563EB;
}

.swissai-chat-escallation-cont .escallation-form button.continue.loading{
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.5;
}




/* user info content */
.swissai-userinfo-cont {
    width: 100%;
    height: 100%;
    background-color:#fff;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    display: none;
    backdrop-filter: blur(5px);
    padding: 5px 15px;
    word-wrap: break-word;
    box-sizing: border-box;
}

.swissai-userinfo-cont.visible {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.swissai-userinfo-cont .userinfo-head{
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    text-align: center;
}

.swissai-userinfo-cont .userinfo-head h2{
    font-size: 15px;
}

.swissai-userinfo-cont .userinfo-head p{
    font-size: 12px;
    color: #777;
}

.swissai-userinfo-cont .userinfo-form{
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-items: center;
    flex-direction: column;
    text-align: center;
    margin-top: 20px;
}

.swissai-userinfo-cont .userinfo-form .input{
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #eee;
    padding: 0 20px;
    box-sizing: border-box;
    outline: none;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    font-family: 'Poppins', sans-serif;
    margin: 10px;
}

.swissai-userinfo-cont .userinfo-form button {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #eee;
    padding: 0 20px;
    box-sizing: border-box;
    outline: none;
    font-size: 13px;
    font-weight: 500;
    background: #3B82F6;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    margin: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.swissai-userinfo-cont .userinfo-form button:hover{
    background-color: #2563EB;
}

.swissai-userinfo-cont .userinfo-form button.close {
    background-color: #eee;
    color: #000;
}

.swissai-userinfo-cont .userinfo-form button.close:hover{
    background-color: #ddd;
}


.swissai-userinfo-cont .userinfo-form button.loading{
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.5;
}


/* Notyf */
.notyf__wrapper{
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
}
  `;
}

function injectThirdPartyScript() {
  const scripts = [
    {
      url: "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
      head: false,
      js: true,
    },
    {
      url: "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js",
      head: false,
      js: true,
    },
    {
      url: "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css",
      head: true,
      js: false,
    },
  ];

  const createAndInsertBeforeTag = (tag, attributes, referenceNode) => {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach((key) => {
      element[key] = attributes[key];
    });
    if (referenceNode)
      referenceNode.parentNode.insertBefore(element, referenceNode);
    else
      document.head.insertAdjacentElement("beforeend", element);
  };

  const mainScript = document.querySelector(
    'script[data-swissai]'
  );
  scripts.forEach((script) => {
    if (script.js) {
      createAndInsertBeforeTag("script", { src: script.url }, mainScript);
    }else{
      createAndInsertBeforeTag("link", { href: script.url, rel: "stylesheet" });
    }
  });
}

function appendChatMessages(messages) {
  const userMessage = `
    <div class="swissai-chat-message-cont">
      <div class="swissai-chat-body-user">
        <div class="swissai-chat-body-user-message-container">
          <div class="swissai-chat-body-user-message">
            <p class="swissai-chat-body-user-message-text">
              {message}
            </p>
          </div>
          <!-- <div class="swissai-chat-message-timestamp">an hr ago</div> -->
        </div>
      </div>
    </div>
  `;
  const aiMessage = `
    <div class="swissai-chat-message-cont">
          <div class="swissai-chat-body-ai">
            <div class="swissai-chat-avatar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-bot"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <div class="swissai-chat-body-ai-message-container">
              <div class="swissai-chat-body-ai-message">
                <p class="swissai-chat-body-ai-message-text">
                  {message}
                </p>
              </div>
              <div class="swissai-chat-message-metadata" style="margin-top:10px; margin-bottom:5px;">{metadata}</div>
              <div class="swissai-chat-message-timestamp">{timestamp}</div>
            </div>
          </div>
        </div>
  `;
  const adminMessage = `
    <div class="swissai-chat-message-cont">
          <div class="swissai-chat-body-ai">
            <div class="swissai-chat-admin-avatar">
              <img src="{image}" width="30" height="30" style="border-radius: 50%;" />
            </div>
            <div class="swissai-chat-body-ai-message-container">
              <div class="swissai-chat-body-ai-message">
                <p class="swissai-chat-body-ai-message-text">
                  {message}
                </p>
              </div>
              <div class="swissai-chat-message-metadata" style="margin-top:10px; margin-bottom:5px;">{metadata}</div>
              <div class="swissai-chat-message-timestamp">{timestamp}</div>
            </div>
          </div>
        </div>
  `;
  const chatBody = document.querySelector(".swissai-chat-body");

  // check if messages is empty
  if(messages.length === 0){
    chatBody.innerHTML = `
      <div class="swissai-chat-empty-message">
        <p class="swissai-chat-empty-message-text">
          No messages yet, start a conversation
        </p>
      </div>
      `;
    return;
  }
  
  chatBody.innerHTML = "";
  messages.forEach((message) => {
    if (message.sender_type === "ANONYMOUS") {
      const userMsg = userMessage.replace("{message}", message.message);
      chatBody.innerHTML += userMsg;
    } else {
      const metadata = message.metadata ?? "";
      let metadatacontent = "";
      if(metadata.length > 0){
        metadatacontent = `
          <a href="${metadata}" class="swissai-metadata-link" target="_blank">${metadata.length > 30 ? `${metadata.slice(0, 40)}...` : metadata}</a>
        `
      }

      if(message.sender_type === "ADMIN"){
        const adminMsg = adminMessage
          .replace("{image}", message.user.image)
          .replace("{message}", marked.parse(message.message))
          .replace("{timestamp}", "an hr ago")
          .replace("{metadata}", "");
        chatBody.innerHTML += adminMsg;
      }

      const aiMsg = aiMessage
        .replace("{message}", marked.parse(message.message))
        .replace("{timestamp}", "an hr ago")
        .replace("{metadata}", metadatacontent);

      if(message.sender_type === "AI") chatBody.innerHTML += aiMsg;
    }
  });
  chatBody.scrollTop = chatBody.scrollHeight;
}

function injectChatBubble() {
  const bubbleHtml = `
    <button class="swissai-chat-activator-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
    </button>
  `;
  const bubble = document.createElement("div");
  bubble.innerHTML = bubbleHtml;
  // bubble.classList.add("swissai-chat-bubble");
  document.body.appendChild(bubble);
}

function handleElementLoadingState(loading, isGlobal = false, _aiLoading = false){
  // inject ai loading state
  showAILoading();
  // handle element loading state
  const chatInput = document.querySelector(".swissai-chat-control-input");
  const aiLoading = document.querySelector(".swissai-ai-loading-cont");
  const modalLoader = document.querySelector(".swissai-modal-loader");
  const sendUserInfoBtn = document.querySelector(".swissai-userinfo-btn");
  const sendEscallationBtn = document.querySelector(
    ".swissai-escallation-btn.continue "
  );


  if(loading){
    
    // disable chat input
    chatInput.disabled = true;
    chatInput.classList.add("disabled");

    // disable send user info btn
    sendUserInfoBtn.disabled = true;
    sendUserInfoBtn.classList.add("loading");

    // disable send escallation btn
    sendEscallationBtn.disabled = true;
    sendEscallationBtn.classList.add("loading");


    // show ai chat loading state
    if (_aiLoading) aiLoading.classList.add("visible");

    // show modal loading
    if(isGlobal){
      modalLoader.classList.add("visible");
    }
  }else{

    // enable chat input
    chatInput.disabled = false;
    chatInput.classList.remove("disabled");

    // enable send user info btn
    sendUserInfoBtn.disabled = false;
    sendUserInfoBtn.classList.remove("loading");

    // enable escallation send btn
    sendEscallationBtn.disabled = false;
    sendEscallationBtn.classList.remove("loading");

    // hide ai chat loading state
    if (_aiLoading) aiLoading.classList.remove("visible");

    // hide modal loading
    if(isGlobal){
      modalLoader.classList.remove("visible");
    }
  }
}

async function returnCss(){
  // for now, fetch the css content from style.css file using fetch api
  const req = await fetch("style.css");
  const res = await req.text();
  return res;
}

function showAILoading() {
  const aiLoading = `
    <div class="swissai-ai-loading-cont">
          <div class="swissai-chat-avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bot"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <div class="swissai-loader">
          </div>
        </div>
  `;
  const chatBody = document.querySelector(".swissai-chat-body");
  chatBody.innerHTML += aiLoading;
}

function disableCollectingUserInfo(){
  const _userInfoCollected =
    JSON.parse(localStorage.getItem("@swissai-info-collected")) ? true : false;
  const allFeatures = document.querySelectorAll(".swissai-feature-btn");
  const infoFeturesBtn = allFeatures[0];
  
  if(_userInfoCollected)  {
    infoFeturesBtn.disabled = true;
    infoFeturesBtn.classList.add("disabled");
    infoFeturesBtn.innerHTML = `✅ Done`;
  }

}

function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scrollToBottom(){
  const chatBody = document.querySelector(".swissai-chat-body");
  chatBody.scrollTop = chatBody.scrollHeight;
}
