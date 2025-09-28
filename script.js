const addBookmarkBtn = document.getElementById("add-bookmark");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkNameInput = document.getElementById("bookmark-name");
const bookmarkUrlInput = document.getElementById("bookmark-url");
const messageBox = document.getElementById("message");

document.addEventListener("DOMContentLoaded", loadBookmarks);

addBookmarkBtn.addEventListener("click", function () {
  let name = bookmarkNameInput.value.trim();
  let url = bookmarkUrlInput.value.trim();

  if (!name || !url) {
    showMessage("⚠️ Please enter both name and URL.", "error");
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  if (saveBookmark(name, url)) {
    addBookmark(name, url);
    showMessage("✅ Bookmark added successfully!", "success");
    bookmarkNameInput.value = "";
    bookmarkUrlInput.value = "";
  }
});

bookmarkUrlInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addBookmarkBtn.click();
});

function addBookmark(name, url) {
  const li = document.createElement("li");

  // div للاسم
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("bookmark-info");
  const link = document.createElement("a");
  link.href = url;
  link.textContent = name;
  link.target = "_blank";
  infoDiv.appendChild(link);

  // div للأزرار
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("bookmark-actions");

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("edit-btn");
  editButton.addEventListener("click", function () {
    showEditDialog(name, url, (newName, newUrl) => {
      updateBookmarkInStorage(name, url, newName, newUrl);
      link.textContent = newName;
      link.href = newUrl;
      showMessage("✏️ Bookmark updated.", "info");
    });
  });

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.classList.add("remove-btn");
  removeButton.addEventListener("click", function () {
    showConfirmDialog(() => {
      bookmarkList.removeChild(li);
      removeBookmarkFromStorage(name, url);
      showMessage("🗑️ Bookmark removed.", "info");
    });
  });

  actionsDiv.appendChild(editButton);
  actionsDiv.appendChild(removeButton);

  // إضافة الأقسام للـ li
  li.appendChild(infoDiv);
  li.appendChild(actionsDiv);

  bookmarkList.appendChild(li);
}

function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem("bookmarks");
  return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmark(name, url) {
  const bookmarks = getBookmarksFromStorage();
  const exists = bookmarks.some((b) => b.url === url);

  if (exists) {
    showMessage("⚠️ This bookmark already exists.", "error");
    return false;
  }

  bookmarks.push({ name, url });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  return true;
}

function loadBookmarks() {
  const bookmarks = getBookmarksFromStorage();
  bookmarks.forEach((bookmark) => addBookmark(bookmark.name, bookmark.url));
}

function removeBookmarkFromStorage(name, url) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.filter(
    (bookmark) => bookmark.name !== name || bookmark.url !== url
  );
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function updateBookmarkInStorage(oldName, oldUrl, newName, newUrl) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.map((bookmark) => {
    if (bookmark.name === oldName && bookmark.url === oldUrl) {
      return { name: newName, url: newUrl };
    }
    return bookmark;
  });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = type;
  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "";
  }, 3000);
}

// Confirm dialog for deletion
function showConfirmDialog(onConfirm) {
  const dialog = document.createElement("div");
  dialog.classList.add("confirm-dialog");

  dialog.innerHTML = `
    <div class="confirm-card">
      <p>Are you sure you want to delete this bookmark?</p>
      <div class="buttons">
        <button class="confirm-yes">Yes</button>
        <button class="confirm-no">No</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  dialog.querySelector(".confirm-yes").addEventListener("click", () => {
    onConfirm();
    document.body.removeChild(dialog);
  });

  dialog.querySelector(".confirm-no").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });
}

// Edit dialog
function showEditDialog(currentName, currentUrl, onConfirm) {
  const dialog = document.createElement("div");
  dialog.classList.add("confirm-dialog");

  dialog.innerHTML = `
    <div class="confirm-card">
      <h3>Edit Bookmark</h3>
      <input type="text" id="edit-name" placeholder="Bookmark Name" value="${currentName}" />
      <input type="text" id="edit-url" placeholder="Bookmark URL" value="${currentUrl}" />
      <div class="buttons">
        <button class="confirm-yes">Save</button>
        <button class="confirm-no">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  const nameInput = dialog.querySelector("#edit-name");
  const urlInput = dialog.querySelector("#edit-url");

  dialog.querySelector(".confirm-yes").addEventListener("click", () => {
    let newName = nameInput.value.trim();
    let newUrl = urlInput.value.trim();

    if (!newName || !newUrl) {
      alert("Please enter both name and URL.");
      return;
    }

    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
      newUrl = "https://" + newUrl;
    }

    onConfirm(newName, newUrl);
    document.body.removeChild(dialog);
  });

  dialog.querySelector(".confirm-no").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });
}
