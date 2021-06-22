const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const Index_URL = BASE_URL + "/api/v1/users/";
const users_per_page = 18;

const users = [];
const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
let filteredUsers = [];
let Pages = [];
let targetPage = "";
let filterGender = [];
let filterSearchMale = [];
let filterSearchFemale = [];
let length = [];
let data = [];
let keyword = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const searchSubmit = document.querySelector("#search-submit");
const sortButton = document.querySelector("#sort-Button");
const allIcon = document.querySelector(".fa-globe-americas");
const maleIcon = document.querySelector(".fa-male");
const femaleIcon = document.querySelector(".fa-female");
const th = document.querySelector(".fa-th");
const bars = document.querySelector(".fa-bars");

//Array (200)
//渲染 Users 畫面
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // 卡片模式
    if (th.matches(".th")) {
      rawHTML += `
        <div class="col-sm-2">
          <div class="sm-2">
            <div class="mb-3">
              <div class="card">
                <img class="detailed-information" data-toggle="modal" data-target="#userModal" data-id="${item.id}" src="${item.avatar}" alt="User avatar">
                <div class="card-body">
                  <h5 class="card-title">${item.name}</h5>
                </div>
                <div class="card-footer">
      `;
      //判斷user是否已在收藏清單，變化按鈕樣式
      list.some((user) => user.id === item.id)
        ? (rawHTML += `            
        <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
      `)
        : (rawHTML += `
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      `);
      rawHTML += `
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      // 清單模式
    } else if (bars.matches(".bars")) {
      rawHTML += `
        <table class="table">
          <tbody>
            <tr>
              <td class="d-flex justify-content-between">
                <span>
                  <img src="${item.avatar}" style="width:50px" alt="">
                  ${item.name} ${item.surname}
                </span>
                <div class="listButton">
                  <button type="button" class="btn btn-primary detailed-information" data-toggle="modal" data-target="#userModal" data-id="${item.id}">More</button>
      `;
      //判斷user是否已在收藏清單，變化按鈕樣式
      list.some((user) => user.id === item.id)
        ? (rawHTML += `
        <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
      `)
        : (rawHTML += `
        <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      `);
      rawHTML += `
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    }
    dataPanel.innerHTML = rawHTML;
  });
}

// 渲染分頁器
function renderPaginator(amount, target) {
  const numberOfPages = Math.ceil(amount / users_per_page);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;

  Pages = document.querySelectorAll(".page-link");
  // 如果要切換分類按鈕時，目標頁瑪 > 總頁碼。目標頁碼回復初始值(第一頁)
  if (targetPage > numberOfPages) {
    targetPage = "";
  }
  // 如果目標頁碼有值，且點擊目標是卡片/清單按紐，顯示當下的頁碼顏色
  // 否則提醒頁碼預設為第一頁
  const curPage =
    targetPage && (target.matches(".fa-th") || target.matches(".fa-bars"))
      ? targetPage - 1
      : 0;

  Pages[curPage].classList.add("currentPage");
}

// 由頁碼取的Users的資料
function getUsersByPage(page, data) {
  const startIndex = (page - 1) * users_per_page;
  return data.slice(startIndex, startIndex + users_per_page);
}

// 顯示UserModel的詳細資訊
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

//加入收藏清單
function addToFavorite(id) {
  const user = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("此 User 已經在收藏清單中");
  }
  list.push(user);
  // 更新收藏清單
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

//移除收藏
function removeFormFavorite(id) {
  //如果沒有收藏 User 就結束涵式，(null 回傳 false，[] 回傳 true)
  if (!list) return;

  const userIndex = list.findIndex((user) => user.id === id);
  //如果找不到此user id，就結束涵式
  if (userIndex === -1) return;
  list.splice(userIndex, 1);
  // 更新收藏清單
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

//移除Icon顏色
function removeIconColor() {
  allIcon.classList.remove("allIcon");
  maleIcon.classList.remove("maleIcon");
  femaleIcon.classList.remove("femaleIcon");
}
// 按下分類按鈕渲染畫面
function sortButtons(target, search) {
  const buttons =
    target.matches(".fa-th") ||
    target.matches(".fa-bars") ||
    target.matches("#search-form");
  // 如果點擊目標是All 或 (All燈亮 且 點擊目標是卡片或清單或提交按鈕)
  if (target.matches(".btn-all") || (allIcon.matches(".allIcon") && buttons)) {
    // search有內容時回傳搜尋過後的users，沒有內容時回傳全部的user
    length = search ? filteredUsers.length : users.length;
    data = search ? filteredUsers : users;
    removeIconColor();
    //開啟All燈
    allIcon.classList.add("allIcon");
    // 如果點擊目標是male 或 (male燈亮 且 點擊目標是卡片或清單或提交按鈕)
  } else if (
    target.matches(".btn-male") ||
    (maleIcon.matches(".maleIcon") && buttons)
  ) {
    filterGender = users.filter((user) => user.gender === "male");
    // search有內容時回傳搜尋過後的男users，沒有內容時回傳全部的男user
    length = search ? filterSearchMale.length : filterGender.length;
    data = search ? filterSearchMale : filterGender;
    removeIconColor();
    //開啟male燈
    maleIcon.classList.add("maleIcon");
    // 如果點擊目標是female 或 (female燈亮 且 點擊目標是卡片或清單或提交按鈕)
  } else if (
    target.matches(".btn-female") ||
    (femaleIcon.matches(".femaleIcon") && buttons)
  ) {
    filterGender = users.filter((user) => user.gender === "female");
    // search有內容時回傳搜尋過後的女users，沒有內容時回傳全部的女user
    length = search ? filterSearchFemale.length : filterGender.length;
    data = search ? filterSearchFemale : filterGender;
    removeIconColor();
    //開啟female燈
    femaleIcon.classList.add("femaleIcon");
  }

  if (data.length === 0) {
    dataPanel.innerHTML = "";
    paginator.innerHTML = "";
    const gender = maleIcon.matches(".maleIcon") ? "男性" : "女性";
    return alert(`您輸入的關鍵字：${keyword} 沒有符合${gender}的 User`);
  }
  // 如果點擊目標是All,male,female,search鈕  顯示第一頁的資料
  if (
    target.matches(".btn-all") ||
    target.matches(".btn-male") ||
    target.matches(".btn-female") ||
    target.matches("#search-form")
  ) {
    targetPage = 1;
  }
  // 當下的頁碼有值時顯示當下頁碼的內容，沒有值時預設顯示內容在第一頁
  const currentPage = targetPage ? targetPage : 1;

  renderPaginator(length, target);
  renderUserList(getUsersByPage(currentPage, data));
}

// 點擊分類按鈕
sortButton.addEventListener("click", function onSortButtonClicked(event) {
  // 開啟清單模式提示顏色
  if (event.target.matches(".fa-bars")) {
    bars.classList.add("bars");
    th.classList.remove("th");
    // 開啟卡片模式提示顏色
  } else if (event.target.matches(".fa-th")) {
    th.classList.add("th");
    bars.classList.remove("bars");
  }

  // 如果點擊分類按鈕時
  if (event.target.matches(".sortBun")) {
    // 處於搜尋狀態時回傳搜尋後的users，否則的話會套用全部的users
    searchSubmit.matches(".submit")
      ? sortButtons(event.target, filteredUsers)
      : sortButtons(event.target);
  }
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  // 點擊圖片，顯示user詳細資料
  if (event.target.matches(".detailed-information")) {
    showUserModel(Number(event.target.dataset.id));
    //點擊收藏按鈕
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
    // 收藏時按鈕會變成紅色
    event.target.classList = "btn btn-danger btn-remove-favorite";
    event.target.textContent = "X";
    // 點擊移除按鈕
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFormFavorite(Number(event.target.dataset.id));
    //取消收藏時按鈕會變成藍綠色
    event.target.classList = "btn btn-info btn-add-favorite";
    event.target.textContent = "+";
  }
});

// 點擊分頁，更新畫面
paginator.addEventListener("click", (event) => {
  if (event.target.tagName !== "A") return;

  targetPage = event.target.dataset.page;
  // 移除全部的頁碼提示顏色
  Pages.forEach((Page) => {
    Page.classList.remove("currentPage");
  });
  // 點擊頁碼後開啟提示顏色
  event.target.classList.add("currentPage");

  const submit = searchSubmit.matches(".submit");
  // 如果all亮
  if (allIcon.matches(".allIcon")) {
    // 在搜尋狀態時回傳搜尋後的users，否則就回傳全部的users
    submit
      ? renderUserList(getUsersByPage(targetPage, filteredUsers))
      : renderUserList(getUsersByPage(targetPage, users));
    //如果male燈亮
  } else if (maleIcon.matches(".maleIcon")) {
    // 在搜尋狀態時回傳搜尋後的男users，否則就回傳全部的男users
    submit
      ? renderUserList(getUsersByPage(targetPage, filterSearchMale))
      : renderUserList(getUsersByPage(targetPage, filterGender));
    // 如果female燈亮
  } else if (femaleIcon.matches(".femaleIcon")) {
    // 在搜尋狀態時回傳搜尋後的女users，否則就回傳全部的女users
    submit
      ? renderUserList(getUsersByPage(targetPage, filterSearchFemale))
      : renderUserList(getUsersByPage(targetPage, filterGender));
  }
});

// 搜尋欄提交按鈕
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  // 防止網頁自動跳轉
  event.preventDefault();
  keyword = searchInput.value.trim().toLowerCase();

  filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.surname.toLowerCase().includes(keyword)
  );
  filterSearchMale = filteredUsers.filter((user) => user.gender === "male");
  filterSearchFemale = filteredUsers.filter((user) => user.gender === "female");
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的 User`);
  }
  // 提交搜尋後，搜尋按鈕改變顏色
  searchSubmit.classList.add("submit");

  sortButtons(event.target, filteredUsers);
  // 如果關鍵字 = 空白 ，提交鈕回復預設顏色
  if (keyword === "") {
    searchSubmit.classList.remove("submit");
  }
});

// 取得API資料
axios.get(Index_URL).then((response) => {
  users.push(...response.data.results);
  allIcon.classList.add("allIcon");
  th.classList.add("th");
  renderPaginator(users.length);
  renderUserList(getUsersByPage(1, users));
});
