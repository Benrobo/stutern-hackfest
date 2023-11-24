window.addEventListener("DOMContentLoaded", async () => {
  await init();
});


const API_URL = "http://localhost:3000/api/";

async function init() {
  injectThirdPartyScript();
  await sleep(1000);

  const swissai_chat_id = _getChatId();

  const isChatIdValid = await checkChatValidity(swissai_chat_id); // a function
  
  if(!isChatIdValid){
    throw new Error("Invalid chat id");
  }else{
    await injectCss();
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

  // chat title
  swissChatTitle.innerHTML = localStorage.getItem("@swissai-chat-name") ?? "Swiss AI Chat";

  // states
  let botLoading = false;
  let globalLoading = true;
  let conversations = [];

  // storage
  const conversation_id = localStorage.getItem("@swissai-conversation-id") ?? null;

  if(conversation_id){
    const conv = await fetchConversations(conversation_id);
    conversations = (conv);
    appendChatMessages(conversations);
  }

  // events
  bubble.onclick = () => chatContainer.classList.toggle("visible");
  
  // handle user message submission
  chatInput.onkeyup = async (e) => {
    const value = e.target.value;
    if (e.key === "Enter"){
      
      handleElementLoadingState(true, false, false);
      const anonymousId = localStorage.getItem("@swissai-anonymous-id") ?? null;
      const resp = await sendAnonymousMsg(value, anonymousId, swissai_chat_id);
      if(resp.success){
        chatInput.value = "";
        const data = resp.data;
        const { conversation_id, anonymous_id } = data;
        localStorage.setItem("@swissai-conversation-id", conversation_id);
        localStorage.setItem("@swissai-anonymous-id", anonymous_id);

        // fetch conversations
        const conv = await fetchConversations(conversation_id);
        conversations = (conv);
        // append messages
        appendChatMessages(conv);
        
        // get ai response
        await requestAIResponse(conversation_id, notyf)
        scrollToBottom();
      }
      else{
        notyf.error(resp.errMsg);
        handleElementLoadingState(false, false, false);
      }
    };
  };
}

async function fetchConversations(conversation_id) {
  try {
    const req = await fetch(
      `${API_URL}chat/conversations/messages/${conversation_id}`
    );
    const res = await req.json();

    console.log(res.data);

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
        <button class="swissai-feature-btn swissai-schedule-meeting" name="schedule-meeting">
          🤙 schedule a meeting
        </button>
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
  const style = document.createElement("style");
  style.innerHTML = await returnCss();
  document.head.appendChild(style);
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

        console.log(adminMsg)
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

  if(loading){
    
    // disable chat input
    chatInput.disabled = true;
    chatInput.classList.add("disabled");

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

function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scrollToBottom(){
  const chatBody = document.querySelector(".swissai-chat-body");
  chatBody.scrollTop = chatBody.scrollHeight;
}
