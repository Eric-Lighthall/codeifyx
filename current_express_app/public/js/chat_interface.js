const chatMessages = document.querySelector('.chat-messages');
const chatContainer = document.querySelector('.full-width-container');
const messageInput = document.getElementById('messageInput');
const emptyState = document.querySelector('.empty-state');

let chatId = chatIdInput.value;

// on message enter
messageInput.addEventListener('keypress', async (event) => {
  if (event.key === 'Enter' && messageInput.value != '') {
    const userMessage = messageInput.value;
    messageInput.value = '';
    addMessageToChat('user', userMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId,
          language: selectedLanguage,
        }),
      });

      if (response.ok) {
        const stream = response.body.pipeThrough(new TextDecoderStream()).getReader();
        const assistantMessageElement = addMessageToChat('assistant', '');
        const assistantMessageContentElement = assistantMessageElement.querySelector('.message-content pre');

        while (true) {
          const { done, value } = await stream.read();
          if (done) break;
          if (value.startsWith('data: ')) {
            const data = JSON.parse(value.slice(6));
            const newChatId = data.chatId;
            const formattedResponse = data.formattedResponse;
            const newChatLanguageLogo = document.querySelector(`.dropdown-menu a[data-language="${selectedLanguage}"] img`).getAttribute('src');

            const recentChatsList = document.querySelector('.recent-chats-list');
            const existingChatItem = recentChatsList.querySelector(`.recent-chat-item a[href="/chat/${newChatId}"]`);
            if (existingChatItem) {
              // Move existing chat item to the top
              const chatItem = existingChatItem.closest('.recent-chat-item');
              recentChatsList.removeChild(chatItem);
              recentChatsList.insertBefore(chatItem, recentChatsList.firstChild);
            }
            else {
              const newChatItem = document.createElement('li');
              newChatItem.classList.add('list-group-item', 'recent-chat-item');

              newChatItem.innerHTML = `
                <a href="/chat/${newChatId}" class="recent-chat-link d-flex align-items-center text-decoration-none">
                  <div class="language-logo-container d-flex align-items-center">
                    <img src="${newChatLanguageLogo}" alt="Language Logo" class="language-logo">
                  </div>
                  <span class="chat-details flex-grow-1 ms-2">New chat...</span>
                  <button class="btn btn-sm btn-danger delete-chat-btn" data-chat-id="${newChatId}">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </a>
              `;
              recentChatsList.insertBefore(newChatItem, recentChatsList.firstChild);
            }
            chatId = newChatId;
            assistantMessageContentElement.innerHTML = formattedResponse;
          }
          else {
            assistantMessageContentElement.innerHTML += value;
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }

        if (chatId) {
          history.pushState(null, '', `/chat/${chatId}`);
        }

      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessageToChat('error', 'Oops! Something went wrong. Please try again.');
    }
  }
});

// append user or AI message to the chat window
function addMessageToChat(role, content) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  if (role === 'user') {
    messageElement.classList.add('user-message');
    messageElement.innerHTML = `
    <div class="message-container">
      <img src="{{user.image}}" alt="User Image" class="user-image rounded-circle">
      <div class="message-content">
        <p>${content}</p>
      </div>
    </div>
  `;
  } else if (role === 'assistant') {
    messageElement.classList.add('assistant-message');
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageElement.innerHTML = `
    <div class="message-container">
      <img src="/images/codeifyxlogosmall.webp" alt="AI Image" class="assistant-image rounded-circle">
      <div class="message-content">
        <pre>${content}</pre>
      </div>
    </div>
  `;
  } else {
    messageElement.innerHTML = `<p>${content}</p>`;
  }

  chatMessages.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  return messageElement;
}

document.addEventListener('DOMContentLoaded', function () {
  const languageDropdownItems = document.querySelectorAll('.dropdown-menu a');
  const languageDropdownButton = document.getElementById('languageDropdown');

  chatContainer.scrollTop = chatContainer.scrollHeight;


  languageDropdownItems.forEach(item => {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      selectedLanguage = this.getAttribute('data-language');
      const selectedLanguageLogo = this.querySelector('img').src;
      languageDropdownButton.innerHTML = `
      <img src="${selectedLanguageLogo}" class="language-logo me-2" />
      ${selectedLanguage}
      <i class="fas fa-caret-down ms-2"></i>
    `;
    });
  });

  // trash buttons for delete
  const recentChatsList = document.querySelector('.recent-chats-list');
  recentChatsList.addEventListener('click', async function (event) {
    if (event.target.closest('.delete-chat-btn')) {
      event.preventDefault();
      const chatId = event.target.closest('.delete-chat-btn').getAttribute('data-chat-id');
      await deleteChat(chatId);
    }
  });

  const selectedLanguageLogo = document.querySelector(`.dropdown-menu a[data-language="${selectedLanguage}"] img`).getAttribute('src');
  languageDropdownButton.innerHTML = `
  <img src="${selectedLanguageLogo}" class="language-logo me-2" />
  ${selectedLanguage}
  <i class="fas fa-caret-down ms-2"></i>
`;
});

async function deleteChat(chatId) {
  try {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: 'DELETE',
    });

    //console.log('Response status:', response.status);
    //console.log('Response body:', await response.json());

    if (response.ok) {
      const chatItem = document.querySelector(`.recent-chat-item a[href="/chat/${chatId}"]`).closest('.recent-chat-item');
      if (chatItem) {
        chatItem.remove();
      }
      const currentChatId = document.getElementById('chatIdInput').value;
      if (!currentChatId || chatId === currentChatId) {
        window.location.href = '/chat';
      }
    }
  }
  catch (error) {
    console.error('Error:', error);
    alert('Failed to delete chat. Please try again.');
  }
};