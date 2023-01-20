const SERVER_URL = "https://academy.directlinedev.com";
const LIMIT = 9;
const loader = document.querySelector(".loader--js");

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
    tags: searchParams.getAll("tags"),
    views: searchParams.get("views"),
    comments: searchParams.getAll("comments"),
    show: searchParams.get("show"),
    sort: searchParams.get("sort"),
  };
};

const setDataToFilter = (data) => {
  const filterForm = document.forms.filter;
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
  return `
    <div class="post">
      <img src="${SERVER_URL}${src}" alt="${title}">
      <div class="post__body">
      <div class="post__tags-wrapper">
         ${tags.map(
           (tag) =>
             `<div class="post__tags" style="background-color: ${tag.tag.color} "></div>`
         )}
      </div>
        <div class="post__info">
          <span class="post__data">${date}</span>
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

const getData = (params) => {
  const result = document.querySelector(".blog__list");

  let xhr = new XMLHttpRequest();
  let searchParams = new URLSearchParams();
  let filter = {};

  console.log("params from getData: ", params);

  searchParams.set("v", "1.0.0");

  if (params.tags && Array.isArray(params.tags) && params.tags.lenght) {
    searchParams.set("tags", JSON.stringify(params.tags));
  }

  filter.page = 1;

  // searchParams.set("filter", JSON.stringify(params.filter));

  if (params.sort) {
    searchParams.set("sort", JSON.stringify([params.sort, "DESC"]));
  }

  xhr.open("GET", SERVER_URL + "/api/posts?");

  console.log("search params to string: ", searchParams.toString());

  // xhr.open("GET", SERVER_URL + "/api/posts?" + searchParams.toString());
  xhr.send();
  result.innerHTML = "";

  // showLoader();

  xhr.onload = () => {
    const response = JSON.parse(xhr.response);
    console.log(response);
    response.data.forEach((card) => {
      const post = createPost(
        card.desktopPhotoUrl,
        card.title,
        card.date,
        card.views,
        card.commentsCount,
        card.text,
        card.tags
      );
      result.insertAdjacentHTML("beforeend", post);
    });
    // hideLoader();
  };

  xhr.error = () => {
    console.log(`Ошибка ${xhr.status}`);
  };
};

(function () {
  const filterForm = document.forms.filter;
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let data = {
      page: 1,
    };

    data.tags = (
      [...filterForm.elements.tags].find((checkbox) => checkbox.checked) || {
        value: null,
      }
    ).value;

    data.views = (
      [...filterForm.elements.views].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;

    data.comments = (
      [...filterForm.elements.comments].find(
        (checkbox) => checkbox.checked
      ) || {
        value: null,
      }
    ).value;

    data.limit = (
      [...filterForm.elements.limit].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;

    data.sort = (
      [...filterForm.elements.sort].find((radio) => radio.checked) || {
        value: null,
      }
    ).value;
  });

  let xhr = new XMLHttpRequest();

  xhr.open("GET", SERVER_URL + "/api/tags");
  xhr.send();
  // showLoader();

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
    // hideLoader();
  };

  xhr.error = () => {
    console.log(`Ошибка ${xhr.status}`);
  };
})();
