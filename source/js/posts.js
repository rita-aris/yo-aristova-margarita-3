const loader = document.querySelector(".loader--js");
const links = document.querySelector(".blog__pagination--js");
const buttonPrev = document.querySelector(".blog__button--prev-js");
const buttonNext = document.querySelector(".blog__button--next-js");

let LIMIT = 9;
let loaderCount = 0;

const showLoader = () => {
  loaderCount++;
  loader.classList.remove("hidden");
};

const hideLoader = () => {
  loaderCount--;
  if (loaderCount <= 0) {
    loader.classList.add("hidden");
    loaderCount = 0;
  }
};

const createTag = ({ id, color }) => {
  color = color.substring(1, 7);
  return `
  <div>
  <input name="tags" type="checkbox" id="tags-${id}" value="${id}" class="checkbox checkbox--${color}" />
  <label for="tags-${id}"></label>
  </div>`;
};

const getParamsFromLocation = () => {
  let searchParams = new URLSearchParams(location.search);

  return {
    name: searchParams.get("name") || "",
    tags: searchParams.getAll("tags"),
    views: searchParams.get("views"),
    comments: searchParams.getAll("comments"),
    limit: searchParams.get("limit"),
    sort: searchParams.get("sort"),
    page: +searchParams.get("page") || 0,
  };
};

const setDataToFilter = (data) => {
  const filterForm = document.forms.filter;

  filterForm.elements.name.value = data.name;

  filterForm.elements.tags.forEach((checkbox) => {
    checkbox.checked = data.tags.includes(checkbox.value);
  });
  filterForm.elements.views.forEach((radio) => {
    radio.checked = data.views === radio.value;
  });
  filterForm.elements.comments.forEach((checkbox) => {
    checkbox.checked = data.comments.includes(checkbox.value);
  });
  filterForm.elements.limit.forEach((radio) => {
    radio.checked = data.limit === radio.value;
  });
  filterForm.elements.sort.forEach((radio) => {
    radio.checked = data.sort === radio.value;
  });
};

const createPost = (src, title, date, views, commentsCount, text, tags) => {
  const dateProcessing = (dateFromServer) => {
    let date = new Date(dateFromServer);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) month = "0" + month;
    if (day < 10) month = "0" + day;
    return `${day}.${month}.${year}`;
  };
  const finalDate = dateProcessing(date);
  return `
    <div class="post">
      <picture>
        <source srcset="${BASE_SERVER_PATH}${
    src.mobilePhotoUrl
  }, ${BASE_SERVER_PATH}${src.mobilePhotoUrl} 2x"
        media="(max-width: 480px)" class="post__image>
        <source srcset="${BASE_SERVER_PATH}${
    src.tabletPhotoUrl
  }, ${BASE_SERVER_PATH}${src.tablet2xPhotoUrl} 2x"
        media="(max-width: 768px)" class="post__image>
        <source srcset="${BASE_SERVER_PATH}${
    src.desktopPhotoUrl
  }, ${BASE_SERVER_PATH}${src.desktop2xPhotoUrl} 2x" class="post__image">
        <img src="${BASE_SERVER_PATH}${
    src.desktopPhotoUrl
  }" alt="Image: ${title}" class="post__image">
      </picture>
      <div class="post__body">
      <div class="post__tags-wrapper">
         ${tags
           .map(
             (tag) =>
               `<div class="post__tags" style="background-color: ${tag.color} "></div>`
           )
           .join(" ")}
      </div>
        <div class="post__info">
          <span class="post__data">${finalDate}</span>
          <span class="post__data">${views} views</span>
          <span class="post__data">${commentsCount} comments</span>
        </div>      
        <h3 class="post__title">${title}</h3>
        <p class="info">${text}</p>
        <a href="#" class="info info--extrabold post__link">Go to this post</a>
       
      </div>
    </div>
  `;
};

const createNewPage = (page) => {
  const links = document.querySelectorAll(".blog__page-number");
  let searchParams = new URLSearchParams(location.search);
  let params = getParamsFromLocation();
  links[params.page].classList.remove("blog__page-number--active");
  searchParams.set("page", page);
  links[page].classList.add("blog__page-number--active");
  history.replaceState(null, document.title, "?" + searchParams.toString());
  getData(getParamsFromLocation());
};

const createLink = (page) => {
  const params = getParamsFromLocation();
  const link = document.createElement("a");

  link.href = "?page=" + page;
  link.innerText = page + 1;
  link.classList.add("blog__page-number");

  if (page === +params.page) {
    link.classList.add("blog__page-number--active");
  }

  link.addEventListener("click", (event) => {
    event.preventDefault();
    createNewPage(page);
  });
  return link;
};

const getData = (params) => {
  const result = document.querySelector(".blog__list");

  let xhr = new XMLHttpRequest();
  let searchParams = new URLSearchParams();
  let filter = {};
  let viewsArray = [];
  let commentsArray = [];

  searchParams.set("v", "1.0.0");

  if (params.name) {
    filter.title = params.name;
  }

  if (params.tags && Array.isArray(params.tags) && params.tags.length) {
    searchParams.set("tags", JSON.stringify(params.tags));
  }

  if (
    params.comments &&
    Array.isArray(params.comments) &&
    params.comments.length
  ) {
    for (let i = 0; i < params.comments.length; i++) {
      let comment = params.comments[i].split("-");
      commentsArray.push(+comment[0]);
      commentsArray.push(+comment[1]);
    }
    filter.commentsCount = {
      $between: [Math.min(...commentsArray), Math.max(...commentsArray)],
    };
    searchParams.set("comments", JSON.stringify(params.comments));
  }

  if (params.views) {
    viewsArray = params.views.split("-");
    filter.views = {
      $between: [viewsArray[0], viewsArray[1]],
    };
    searchParams.set("views", JSON.stringify(params.views));
  }

  if (params.sort) {
    searchParams.set("sort", JSON.stringify([params.sort, "DESC"]));
  }

  if (params.limit) {
    LIMIT = params.limit;
  }

  searchParams.set("limit", LIMIT);

  if (+params.page) {
    searchParams.set("offset", +params.page * LIMIT);
  }

  searchParams.set("filter", JSON.stringify(filter));

  xhr.open("GET", BASE_SERVER_PATH + "/api/posts?" + searchParams.toString());
  xhr.send();
  result.innerHTML = "";

  links.innerHTML = "";

  showLoader();

  xhr.onload = () => {
    const response = JSON.parse(xhr.response);

    let dataPost = "";

    response.data.forEach((card) => {
      dataPost += createPost(
        card.photo,
        card.title,
        card.date,
        card.views,
        card.commentsCount,
        card.text,
        card.tags
      );
      result.innerHTML = dataPost;
    });
    const pageCount = Math.ceil(response.count / LIMIT);

    buttonPrev.removeAttribute("disabled");
    buttonNext.removeAttribute("disabled");

    if (params.page === 0) {
      buttonPrev.setAttribute("disabled", "");
    }

    if (params.page === pageCount - 1) {
      buttonNext.setAttribute("disabled", "");
    }

    for (let i = 0; i < pageCount; i++) {
      const link = createLink(i);
      links.insertAdjacentElement("beforeend", link);
    }

    buttonPrev.addEventListener("click", () => {
      params.page = params.page - 1;
      createNewPage(params.page);
    });

    buttonNext.addEventListener("click", () => {
      params.page = params.page + 1;
      createNewPage(params.page);
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "ArrowLeft") {
        params.page = params.page - 1;
        createNewPage(params.page);
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "ArrowRight") {
        params.page = params.page + 1;
        createNewPage(params.page);
      }
    });

    hideLoader();
  };

  xhr.error = () => {
    console.log(`Ошибка ${xhr.status}`);
  };
};

const setSearchParams = (data) => {
  let searchParams = new URLSearchParams();

  searchParams.set("name", data.name);

  data.tags.forEach((tag) => searchParams.append("tags", tag));

  if (data.page) {
    searchParams.set("page", data.page);
  } else {
    searchParams.set("page", 0);
  }

  if (data.views) {
    searchParams.set("views", data.views);
  }

  data.comments.forEach((comment) => searchParams.append("comments", comment));

  if (data.limit) {
    searchParams.set("limit", data.limit);
  }

  if (data.sort) {
    searchParams.set("sort", data.sort);
  }

  history.replaceState(null, document.title, "?" + searchParams.toString());
};

(function () {
  const filterForm = document.forms.filter;
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let data = {
      page: 0,
    };

    data.name = filterForm.elements.name.value;

    data.tags = [...filterForm.elements.tags]
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    data.views = (
      [...filterForm.elements.views].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;

    data.limit = (
      [...filterForm.elements.limit].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;

    data.comments = [...filterForm.elements.comments]
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    data.sort = (
      [...filterForm.elements.sort].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;

    getData(data);
    setSearchParams(data);
  });

  let xhr = new XMLHttpRequest();

  xhr.open("GET", BASE_SERVER_PATH + "/api/tags");
  xhr.send();
  showLoader();

  xhr.onload = () => {
    const tags = JSON.parse(xhr.response).data;
    const tagsBox = document.querySelector(".tags--js");
    tags.forEach((tag) => {
      tagHTML = createTag(tag);
      tagsBox.insertAdjacentHTML("beforeend", tagHTML);
    });
    const params = getParamsFromLocation();
    setDataToFilter(params);
    getData(params);
    hideLoader();
  };

  xhr.error = () => {
    console.log(`Ошибка ${xhr.status}`);
  };
})();
