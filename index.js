let initResultArr = []
let moviesCache = []

const input = document.getElementById('user-input')
const searchBtn = document.getElementById('search-btn')
const resultList = document.getElementById('result-list')
const textPlaceholder = document.getElementById('start-search')
const clearAll = document.querySelector('.fa-xmark')

/* Run when on search page */
if (!document.getElementById('watch-list')) {
    
    searchBtn.addEventListener('click', () => triggerSearch())
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter')
            triggerSearch()}
    )
}
    
async function triggerSearch() {
    // const userInput = input.value.split(' ').join('+')
    const userInput = encodeURIComponent(input.value)

    if (!userInput) return

    const res = await fetch(`https://www.omdbapi.com/?i=tt3896198&apikey=60066fa0&s=${userInput}`)
    const data = await res.json()
    
    if (data.Response === 'False') {
        resultList.innerHTML = ''
        textPlaceholder.style.display = 'flex'
        textPlaceholder.innerHTML = `
        <p class='screen-msg'>Unable to find what you're looking for. Please try another search.</p>
        `
        // temporarily change the placeholder text
        // when NO result found
        showNoResultPlaceholder()
        
        return
    }

    function showNoResultPlaceholder() {
        input.value = ''
        input.placeholder = 'No result found'

        const restore = () => {
            input.placeholder = 'Search for a movie'
            input.removeEventListener('focus', restore)
        }

        input.addEventListener('focus', restore)
    }

    initResultArr = data.Search.map( ({imdbID}) => ({imdbID}))
    
    const obj = []
    
    initResultArr.map(a => obj.push(a.imdbID))
    
    // console.log(obj)
    
    const searchResultArr = obj.filter((item, index) =>
        obj.indexOf(item) === index)
    
    // console.log(searchResultArr)
    
    parseMovies(searchResultArr)
    
    async function getMovieInfo(a) {        
        const res = await fetch(`https://www.omdbapi.com/?&apikey=60066fa0&i=${a}`)
        return res.json()
    }
    
    async function parseMovies(arr) {
        moviesCache = await Promise.all(
            arr.map(getMovieInfo)
        )
        renderMovieList(moviesCache)
        textPlaceholder.style.display = 'none'
    }
    
    function renderMovieList(arr) {
        renderInfo(arr)

        const plot = document.querySelectorAll('.plot-div')
        
        plot.forEach(p => {
                if (p.querySelector('.plot').textContent.endsWith('...'))
                    p.querySelector('.readmore').textContent = " Readmore"
            })        
    }
    

    function renderInfo(arr) {
        resultList.innerHTML = arr.map(a => {
            return (`
                <div class='list-item' data-id='${a.imdbID}'>
                    <div>
                        <img class='poster' src=${a.Poster}>
                    </div>
                    <div>
                        <div class='header-div'>
                            <h2 class='title'>${a.Title}</h2>
                            <i class="fa-solid fa-star" style="color: #FFD43B"></i>
                            <p class='rating'>${a.imdbRating}</p>
                        </div>
                        <ul class='desc'>
                            <li>${a.Runtime}</li>
                            <li>${a.Genre}</li>
                            <div class='plus' data-id='${a.imdbID}'>+</div>
                            <li>Watchlist</li>
                            
                        </ul>
                        <div class='plot-div'>
                            <p class='plot'>${a.Plot}<span class='readmore'></span></p>
                        </div>
                    </div>
                </div>
            `)
        }).join('')
    }

    resultList.addEventListener('click', (e) => {
        const btnClicked = e.target.closest('.plus')
        if (!btnClicked)
            return
        
        const btnId = btnClicked.dataset.id
        const existingID = JSON.parse(localStorage.getItem('watchlist'))
        
        //check if is the first movie added or the movie already exists
        if (!existingID || (existingID && !existingID.map( ({imdbID}) => (imdbID)).includes(btnId))) {
            addToLocalStorage(btnId)
            toastMsg(btnId)
        }

        else {
            alert('movie already addedd!')
        }
    })
    
    function addToLocalStorage(id) {
        const matchedMovie = moviesCache.find(m => m.imdbID === id)
        if (!matchedMovie)
            return
            
        const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || []
        
        if (savedWatchlist.includes(matchedMovie)) return
        
        savedWatchlist.push(matchedMovie)
        localStorage.setItem('watchlist', JSON.stringify(savedWatchlist))
        }

    function toastMsg(id) {
        const eleList = document.querySelectorAll('.list-item')

        eleList.forEach(item => {
            if (item.dataset.id === id) {
                const name = item.querySelector('.title').textContent

                const toastEle = document.createElement('li')
                item.querySelector('.desc').appendChild(toastEle)

                toastEle.innerHTML = `
                    <i class="fa-solid fa-bell fa-rotate-by" style="color: #5db7ceff; --fa-rotate-angle: -30deg;"></i>
                    <p>'${name}' added to watchlist</p>
                `
                // toast disappears after 3 seconds
                setTimeout(function() { toastEle.innerHTML = ''}
                , 3000)
                }
            })
    } 

    clearAll.addEventListener("click", () => clearAllInput())
    
    function clearAllInput() {
        input.value = ''
    }
}


/* Run to clear localStorage */

// localStorage.removeItem('watchlist')

/* Run the following on watchlist page */
document.addEventListener("DOMContentLoaded", () => {
    const watchlist = document.getElementById('watch-list')
    const removeAll = document.getElementById('remove-btn')
    const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || []
    
    removeAll.addEventListener('click', function() {
        localStorage.removeItem('watchlist')
        watchlist.innerHTML = ''
    })

    if (watchlist)
        renderWatchlist()
    
    function renderWatchlist() {
        if (!savedWatchlist) return
        
        watchlist.innerHTML = savedWatchlist.map(m => {return (
            `
            <div class='list-item'>
            <div>
            <img class='poster' src=${m.Poster}>
            </div>
            <div>
            <div class='header-div'>
            <h2 class='title'>${m.Title}</h2>
            <i class="fa-solid fa-star" style="color: #FFD43B"></i>
            <p class='rating'>${m.imdbRating}</p>
            </div>
            <ul class='desc'>
            <li>${m.Runtime}</li>
            <li>${m.Genre}</li>
            <div class='remove' data-id='${m.imdbID}'>-</div>
            <li>Remove</li>
            </ul>
            <div class='plot-div'>
            <p class='plot'>${m.Plot}<span class='readmore'></span></p>
            </div>
            </div>
            </div>
            `)
        }).join()
    }
    
    if (!resultList) {
    const removeBtn = document.querySelectorAll('.remove')
    
    watchlist.addEventListener('click', e => {
        const btnClicked = e.target.closest('.remove')
        if (!btnClicked) return
        
        const id = btnClicked.dataset.id
        
        removeFromWatchlist(savedWatchlist, id)
        renderWatchlist()
    })}
    
    function removeFromWatchlist(arr, id) {
        const indexOfTarget = arr.findIndex(obj => obj.imdbID === id)

        arr.splice(indexOfTarget, 1)
        localStorage.setItem('watchlist', JSON.stringify(arr))
        return(arr)
    }
})

