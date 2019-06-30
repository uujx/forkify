import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResPage.innerHTML = '';
};

// Private function for checking the title
export const titleLimit = (title, limit = 17) => { 
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')} ...`
    }
    return title;
};


export const highlightSelected = id => {
    const resultArr = Array.from(document.querySelectorAll('.reuslt__link'));
    resultArr.forEach(el => {
        el.classList.remove('results__link--active');
    })

    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};

// type: 'next' or 'prev'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

const renderButton = (page, numOfResults, resPerPage) => {
    const pages = Math.ceil(numOfResults / resPerPage);
    let button;

    if (page === 1 && pages > 1) {
        // Only button to the next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // Both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) {
        // Only button to the prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPage.insertAdjacentHTML('afterbegin', button);
};

// Private function for processing each of the recipes
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${titleLimit(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;

    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

export const renderResults = (results, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    results.slice(start, end).forEach(renderRecipe);
    renderButton(page, results.length, resPerPage);
};




