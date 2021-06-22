const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const Index_URL = BASE_URL + "/api/v1/users/";
const users_per_page = 18;

let Pages = [];
let targetPage = ""

//收藏清單
const users = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");
//渲染 Users 畫面
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-2">
        <div class="sm-2">
          <div class="mb-3">
            <div class="card">
              <img class="card-img-top" data-toggle="modal" data-target="#userModal" data-id="${item.id}" src="${item.avatar}" alt="User avatar">
              <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// 渲染分頁器 
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / users_per_page);
  let rawHTML = "";
  if (numberOfPages === 0) {
    return (paginator.innerHTML = "");
  } else {
    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    paginator.innerHTML = rawHTML;
  }
  Pages = document.querySelectorAll(".page-link");
  // 如果移除的是最後一頁的最後一筆user，自動回到前一頁
  if (targetPage > numberOfPages) {
    targetPage -= 1;
  }
  const currentPage = targetPage ? targetPage - 1 : 0;
  // 當前得頁碼會變色提醒
  Pages[currentPage].style = "background-color: #148aa4 ; color: #ffffff";
}

// 由頁碼取的Users的資料 
function getUsersByPage(page) {
  const startIndex = (page - 1) * users_per_page;
  return users.slice(startIndex, startIndex + users_per_page);
}

// 點擊分頁 
paginator.addEventListener("click", (event) => {
  if (event.target.tagName !== "A") return;

  targetPage = Number(event.target.dataset.page);
  // 移除全分頁style
  Pages.forEach((Page) => {
    Page.style = "";
  });
  // 點擊的頁碼會變色
  event.target.style = "background-color: #148aa4 ; color: #ffffff";
  renderUserList(getUsersByPage(targetPage));
});

// 顯示User的詳細資訊
function showUserModel(id) {
  const userTitle = document.querySelector("#user-modal-title");
  const userImage = document.querySelector("#user-model-image");
  const userGender = document.querySelector("#user-model-gender");
  const userAge = document.querySelector("#user-model-age");
  const userRegion = document.querySelector("#user-model-region");
  const userBirthday = document.querySelector("#user-model-birthday");
  const userEmail = document.querySelector("#user-model-email");

  axios.get(Index_URL + id).then((response) => {
    const data = response.data;
    console.log(response.data);
    userTitle.textContent = `${data.name} ${data.surname}`;
    userImage.innerHTML = `<img src="${data.avatar}" alt="user-avatar" class="img-fluid">`;
    userGender.textContent = "Gender: " + data.gender;
    userAge.textContent = "Age: " + data.age;
    userRegion.textContent = "Region: " + data.region;
    userBirthday.textContent = "Birthday: " + data.birthday;
    userEmail.textContent = "Email: " + data.email;
  });
}
//移除收藏
function removeFormFavorite(id) {
  //如果沒有收藏 User 就結束涵式，(null 回傳 false，[] 回傳 true)
  if (!users) return;

  let userIndex = users.findIndex((user) => user.id === id);
  //如果找不到此user id，就結束涵式
  if (userIndex === -1) return;
  users.splice(userIndex, 1);
  // 更新收藏清單
  localStorage.setItem("favoriteUsers", JSON.stringify(users));
  renderPaginator(users.length);
  // 如果移除的是最後一頁的最後一筆user，自動回到前一頁
  if (users.length === userIndex) {
    userIndex -= 1;
  }
  //移除的 user 當下頁碼
  const userPage = Math.ceil((userIndex + 1) / users_per_page);
  renderUserList(getUsersByPage(userPage));
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  //點擊圖片顯示詳細資料
  if (event.target.matches(".card-img-top")) {
    showUserModel(Number(event.target.dataset.id));
    //點擊移除按鈕
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFormFavorite(Number(event.target.dataset.id));
  }
});

// 渲染初始頁面
renderPaginator(users.length);
renderUserList(getUsersByPage(1));
