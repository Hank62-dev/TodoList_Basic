document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Form submitted"); //chặn sự kiện submit gây ra reset trang
    let name = document.querySelector("#name").value.trim();
    if (!name) {
        showAlert("Vui lòng nhập tên công việc!", "warning");
        return;
    }
    let item = {
        id: new Date().toISOString(),
        name,
    };
    //lưu item vào localStore
    addItemToLS(item);
    //render id lên giao diện
    addItemToUI(item);
    showAlert("Thêm công việc thành công!", "success");

    document.querySelector("#name").value = "";
});

// getList(): lấy danh sách các item trong localStore về
// nếu chưa có thì trả về mảng rỗng []
const getList = () => {
    return JSON.parse(localStorage.getItem("todoList")) || [];
};

// addItemToLS(item): hàm nhận vào item và lưu item vào ls
const addItemToLS = (item) => {
    let list = getList();
    list.push(item);
    localStorage.setItem("todoList", JSON.stringify(list));
};
// addItemToUI(item): nhận vào hàm và render item lên giao diện
const addItemToUI = ({id, name}) => {
    const newCard = document.createElement("div");
    newCard.className = "card d-flex flex-row justify-content-between align-items-center p-2 mt-3";
    newCard.innerHTML = `
        <span class="item-name">${name}</span>
        <div class="d-flex gap-1">
            <button type="button" class="btn btn-warning btn-sm btn-edit" data-id="${id}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm btn-remove" data-id="${id}">Remove</button>
        </div>
    `;
        document.querySelector("#list").appendChild(newCard);
};  

// init: render lại các item có trong localStore lên giao diện
const init = () => {
    let list = getList();
    list.forEach((item) => { 
        addItemToUI(item);
        
    });
};
document.addEventListener("DOMContentLoaded", (event) => {
    init();
});

//removeItemFromLS(id): hàm nhận vào id và xóa item khỏi localStore
const removeItemFromLS = (itemId) => {
    let list = getList();
    let index = list.findIndex((item) => item.id == itemId);
    list.splice(index, 1);
    localStorage.setItem("todoList", JSON.stringify(list));
};

// cập nhật item trong localStorage
const updateItemInLS = (id, newName) => {
    let list = getList();
    const index = list.findIndex((item) => item.id === id);
    if (index !== -1) {
        list[index].name = newName;
        localStorage.setItem("todoList", JSON.stringify(list));
    }
};

// sự kiện xóa
document.querySelector("#list").addEventListener("click", (event) => {
    const card = event.target.closest(".card");

    if(event.target.classList.contains("btn-remove")){
        const name = card.querySelector(".item-name").innerText;
        let isConfirmed = confirm(`Bạn có chắc muốn xóa công việc "${name}" không?`);
        if(isConfirmed){
            let id = event.target.getAttribute("data-id");
            event.target.parentElement.remove();
            card.remove();
            removeItemFromLS(event.target.id);
            showAlert(`Đã xóa công việc "${name}" thành công!`, "danger");
        }
        return;
    }

    if (event.target.classList.contains("btn-edit")) {
        const span = card.querySelector(".item-name");
        const oldName = span.textContent;

        // tạo input để sửa
        const input = document.createElement("input");
        input.type = "text";
        input.className = "form-control form-control-sm";
        input.value = oldName;

        span.replaceWith(input);
        input.focus();

        // đổi nút Edit → Save
        event.target.textContent = "Save";
        event.target.classList.remove("btn-edit", "btn-warning");
        event.target.classList.add("btn-save", "btn-success");

        return; // dừng ở đây, không chạy phần Save
    }

    // SAVE
    if (event.target.classList.contains("btn-save")) {
        const input = card.querySelector("input");
        const newName = input.value.trim();
        const id = event.target.getAttribute("data-id");

        if (!newName) {
            showAlert("Tên công việc không được để trống!", "warning");
            return;
        }

        // cập nhật UI
        const span = document.createElement("span");
        span.className = "item-name";
        span.textContent = newName;
        input.replaceWith(span);

        // đổi nút Save → Edit
        event.target.textContent = "Edit";
        event.target.classList.remove("btn-save", "btn-success");
        event.target.classList.add("btn-edit", "btn-warning");

        // cập nhật localStorage
        updateItemInLS(id, newName);

        showAlert("Cập nhật công việc thành công!", "info");
    }
});

// sự kiện xóa tất cả
document.querySelector("#btn-remove-all").addEventListener("click", (event) => {
    let isConfirmed = confirm("Bạn có chắc muốn xóa tất cả công việc không?");
    if(isConfirmed){
        localStorage.removeItem("todoList");//xóa local
        document.querySelector("#list").innerHTML = "";//xóa giao diện
    }
    showAlert(`Đã xóa tất cả công việc thành công!`, "danger");
});

// sự kiện tìm kiếm filter
document.querySelector("#filter").addEventListener("keyup", (event) => {
    const valueInput = event.target.value;
    let list = getList();
    list = list.filter((item) => item.name.includes(valueInput));
    // xóa danh sách hiện có và render danh sách đã lọc
    document.querySelector("#list").innerHTML = "";
    list.forEach((item) => {
        addItemToUI(item);
    });
});

// hiện thanh thbao thành công
const showAlert = (message, type = "success") => {
    const alertContainer = document.querySelector("#alert-container");
    const alert = document.createElement("div");

    alert.className = `alert alert-${type} text-center mt-3`;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
};
