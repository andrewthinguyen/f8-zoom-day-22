const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addtaskModal = $("#addTaskModal");
const modalOverlay = $(".modal-overlay");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todoList");
const formTitle = addtaskModal.querySelector(".modal-title");
const submitBtn = addtaskModal.querySelector(".submit-btn");
const searchInput = $(".search-input");
const labelTab = $(".tab-list");

let editIndex = null;
//Ghi chú trước bài học:

//hàm xử lý đóng form
function closeForm() {
  addtaskModal.className = "modal-overlay";

  if (formTitle) {
    formTitle.textContent = formTitle.dataset.goc || formTitle.textContent;
    delete formTitle.dataset.goc;
  }

  if (submitBtn) {
    submitBtn.textContent = submitBtn.dataset.goc || submitBtn.textContent;
    delete submitBtn.dataset.goc;
  }
  //Cuộn lên đầu form

  addtaskModal.querySelector(".modal").scrollTop = 0;

  editIndex = null;
}
//hàm xử lý mở form
function openForm() {
  addtaskModal.className = "modal-overlay show";
  setTimeout(() => {
    titleInput.focus();
  }, 100);
}
//gọi sẵn hàm để hiện form ra cho dễ xử lý xong sẽ xoá:
// openForm();

//Xử lý để form hiện ra:
addBtn.onclick = openForm;
//Xử lý để form đóng lại:
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

//xử lý khi form submit
todoForm.onsubmit = (event) => {
  event.preventDefault();
  //Viết đầy đủ là Object.fromEntries(Array.from(new FormData(todoForm).entries()));
  //Lấy toàn bộ form data (Dữ liệu từ các input, textarea,....)
  const formData = Object.fromEntries(new FormData(todoForm));

  //xử lý tiêu đề bị trùng
  function checkTrung() {
    const input = formData.title.trim().toLowerCase();
    const isDuplicate = todoTasks.some((task) => {
      return task.title.trim().toLowerCase() === input;
    });
    if (isDuplicate) {
      alert(
        "Tiêu đề trùng, chúng tôi vẫn lưu dữ liệu công việc cho bạn, bạn vẫn có thể sửa tiêu đề bằng cách vào Edit!"
      );
    }
  }

  //nếu có edit index, tức đang mở modal sửa => thựch iện logic sửa
  if (editIndex) {
    checkTrung();
    todoTasks[editIndex] = formData;
    renderToast("Sửa");
  } else {
    formData.isCompleted = false; //thêm 1 trường vào formData và mặc định chưa được hoàn thành.
    //Thêm task vào đầu danh sách công việc
    checkTrung();
    todoTasks.unshift(formData);
    renderTask(todoTasks);
    renderToast("Thêm");
  }

  //Lưu toàn bộ danh sách
  saveTask();
  //reset form
  todoForm.reset();
  closeForm();

  renderTask(todoTasks);
};
function saveTask() {
  localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}

todoList.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");

  ///bấm nút sửa và đưa dữ liệu vào
  if (editBtn) {
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];
    // gán giá trị cho Edit Index để xác định đang sửa cho trường nào
    editIndex = taskIndex;
    // gán giá trị cho Edit Index để xác định đang sửa cho trường nào
    for (const key in task) {
      const value = task[key];
      const input = $(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    }
    //const formTitle = addtaskModal.querySelector(".modal-title");   đã khai báo ra ngoài do cần dùng ở nhiều hàm.
    if (formTitle) {
      formTitle.dataset.goc = formTitle.textContent;
      formTitle.textContent = "Edit Task";
    }
    if (submitBtn) {
      submitBtn.dataset.goc = submitBtn.textContent;
      submitBtn.textContent = "Save Task";
    }
    openForm();
  }
  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];
    if (confirm(`Bạn muốn xoá Task "${task.title}"này?`)) {
      todoTasks.splice(taskIndex, 1);
      renderTask(todoTasks);
      saveTask();
      renderToast("Xoá");
    }
  }
  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index;
    const task = todoTasks[taskIndex];
    task.isCompleted = !task.isCompleted;
    renderTask(todoTasks);
    saveTask();
  }
};

function escapeHTML(html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

function renderTask(task) {
  if (!task.length) {
    todoList.innerHTML = `<p>Bạn chưa thêm công việc nào</p>`;
    return;
  }
  const html = task
    .map(
      (task, index) => `
    <div class="task-card ${escapeHTML(task.color)} ${
        task.isCompleted ? "completed" : ""
      }">
      <div class="task-header">
        <h3 class="task-title">${escapeHTML(task.title)}</h3>
        <button class="task-menu">
          <i class="fa-solid fa-ellipsis fa-icon"></i>
          <div class="dropdown-menu">
            <div class="dropdown-item edit-btn" data-index="${index}">
              <i class="fa-solid fa-pen-to-square fa-icon"></i>
              Edit
            </div>
            <div class="dropdown-item complete-btn" data-index="${index}">
              <i class="fa-solid fa-check fa-icon"></i>
              ${task.isCompleted ? "Mark as Active" : "Mark as complete"}
            </div>
            <div class="dropdown-item delete delete-btn" data-index="${index}">
              <i class="fa-solid fa-trash fa-icon"></i>
              Delete
            </div>
          </div>
        </button>
      </div>
      <p class="task-description">
        ${escapeHTML(task.description)}
      </p>
      <div class="task-time">${escapeHTML(task.starttime)} - ${escapeHTML(
        task.endtime
      )}</div>
    </div>
    `
    )
    .join("");
  todoList.innerHTML = html;
}

//render lần đầu để hiển thị danh sách task từ localStorage;
renderTask(todoTasks);

//xử lý hiển thị toast
function renderToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `
    <div class="toast__icon">✔</div>
    <div class="toast__body">
      <h3 class="toast__title">Success</h3>
      <p class="toast__msg">${message} công việc thành công!</p>
    </div>
    <div class="toast__close">&times;</div>
  </div>
    `;
  document.getElementById("toastContainer").appendChild(toast);

  // Tự xoá sau 3 giây
  // setTimeout(() => toast.remove(), 3000);
}

const buttonTab = labelTab.querySelectorAll(".tab-button");
buttonTab.forEach((element) => {
  element.addEventListener("click", () => {
    buttonTab.forEach((btn) => {
      btn.classList.remove("active");
    });
    element.classList.add("active");
    if (element.textContent === "Chưa Hoàn Thành") {
      const notFiltered = todoTasks.filter(function (tasks) {
        return !tasks.isCompleted;
      });
      renderTask(notFiltered);
    } else if (element.textContent === "Đã Hoàn Thành") {
      const filteredTask = todoTasks.filter(function (tasks) {
        return tasks.isCompleted;
      });
      renderTask(filteredTask);
    } else {
      renderTask(todoTasks);
    }
  });
});

//xử lý nhảy về tab tất cả công việc.

searchInput.addEventListener("focus", () => {
  if (buttonTab.textContent !== "Tất cả Công việc") {
    buttonTab.forEach((btn) => {
      btn.classList.remove("active");
    });
    renderTask(todoTasks);
    labelTab.querySelector(".default-tab").classList.add("active");
  }
});

//tìm kiếm
searchInput.oninput = function (event) {
  const result = searchInput.value; //event.target.value

  if (result.trim().length) {
    const foundResult = todoTasks.filter((item) => {
      return (
        item.title.toLowerCase().includes(result.toLowerCase()) ||
        item.description.toLowerCase().includes(result.toLowerCase())
      );
    });
    renderTask(foundResult);
  } else {
    renderTask(todoTasks);
  }
};
