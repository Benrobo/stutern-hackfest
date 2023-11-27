window.addEventListener("DOMContentLoaded", async () => {
  await init();
});


// const API_URL = "http://localhost:3000/api/";
const API_URL = "https://swissai.vercel.app/api/";

async function init() {
  injectThirdPartyScript();
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
  const refreshConversation = document.querySelector(".swissai-refresh-conversation");
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
  refreshConversation.onclick = async () => {
    const localDB = returnLocalDB(swissai_chat_id);
    const conv_id = localDB?.conversation_id ?? null;
    if (conv_id) {
      handleElementLoadingState(true, true, false);
      const conv = await fetchConversations(conv_id);
      handleElementLoadingState(false, false, false);
      appendChatMessages(conv);
    }
  };

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



  // storage
  const localDB = returnLocalDB(swissai_chat_id);
  const conversation_id = localDB?.conversation_id ?? null;

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
      
      const localDB = returnLocalDB(swissai_chat_id);
      const anonymousId = localDB?.anonymous_id ?? null;
      
      const resp = await sendAnonymousMsg(value, anonymousId, swissai_chat_id);
      
      if (resp.success) {
        chatInput.value = "";
        const data = resp.data;
        const { conversation_id, anonymous_id } = data;

        // use chatID as the key for storing conversation id
        const payload = {
          conversation_id,
          anonymous_id,
        }

        // check if swissai_chat_id is already in localstorage
        if(!localStorage.getItem(swissai_chat_id)){
          // store conversation id and anonymous id
          localStorage.setItem(swissai_chat_id, JSON.stringify(payload));
        }


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
    const localDB = returnLocalDB(_getChatId());
    let convId = localDB?.conversation_id ?? null;
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

    localStorage.setItem(`${_getChatId()}_info_collected`, true);

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

function returnLocalDB(chatId){
  const localDB = localStorage.getItem(chatId) ? JSON.parse(localStorage.getItem(chatId)) : null;
  return localDB;
}

function injectMainChatContainer() {
  const chatContainer = `
    <div class="swissai-chat-container">
      <!-- head -->
      <div class="swissai-chat-header">
        <div class="swissai-chat-header-title">
          <h3 class="swissai-title">Swiss AI Chat</h3>
        </div>
        <div class="right">
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
        <button class="swissai-refresh-conversation">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
        </button>
        </div>
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
              <!--<div class="swissai-chat-message-timestamp">{timestamp}</div> -->
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
              <!-- <div class="swissai-chat-message-timestamp">{timestamp}</div> -->
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
  const refreshConversation = document.querySelector(
    ".swissai-refresh-conversation"
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

    // disable refresh conversation btn
    refreshConversation.disabled = true;
    refreshConversation.classList.add("loading");


    // show ai chat loading state
    if (_aiLoading) aiLoading.classList.add("visible");

    // show modal loading
    if (isGlobal && modalLoader) {
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

    // enable refresh conversation btn
    refreshConversation.disabled = false;
    refreshConversation.classList.remove("loading");


    // hide ai chat loading state
    if (_aiLoading) aiLoading.classList.remove("visible");

    // hide modal loading
    if (isGlobal && modalLoader) {
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
    JSON.parse(localStorage.getItem(`${_getChatId()}_info_collected`)) ? true : false;
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
