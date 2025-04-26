document.addEventListener('DOMContentLoaded', () => {
    const mainSection = document.querySelector('.main-section')
    if (mainSection) {
        mainSection.innerHTML = '<p>Loading notes...</p>'
        fetch('courses.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch course data')
                }
                return response.json()
            })
            .then(data => {
                mainSection.innerHTML = ''
                data.forEach(course => {
                    const courseDiv = document.createElement('div')
                    courseDiv.className = 'note'
                    courseDiv.innerHTML = `
                        <h3>${course.courseCode}</h3>
                        <p>${course.description}</p>
                        <a href="detail.html?id=${course.id}">Show Details</a>
                    `
                    mainSection.appendChild(courseDiv)
                })
            })
            .catch(error => {
                mainSection.innerHTML = '<p>Error loading notes.</p>'
            })
    }
})

let allCourses = []
let currentPage = 1
let itemsPerPage = 4
let searchTerm = ''
let sortOption = ''

document.addEventListener('DOMContentLoaded', () => {
    const mainSection = document.querySelector('.main-section')
    const searchInput = document.querySelector('.search')
    const sortSelect = document.querySelector('select[name="sort"]')
    const paginationDiv = document.querySelector('.btn-section div:first-child')

    document.querySelector('.loading').style.display = 'block'

    fetch('courses.json')
        .then(response => response.json())
        .then(data => {
            allCourses = data
            renderCourses()
            renderPagination()
        })
        .finally(() => {
            document.querySelector('.loading').style.display = 'none'
        })

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase()
            currentPage = 1
            renderCourses()
            renderPagination()
        })
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortOption = e.target.value
            renderCourses()
        })
    }

    if (paginationDiv) {
        paginationDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault()
                const page = e.target.dataset.page
                if (page) {
                    currentPage = parseInt(page)
                    renderCourses()
                    renderPagination()
                }
            }
        })
    }
})

function renderCourses() {
    const mainSection = document.querySelector('.main-section')
    if (!mainSection) return

    let filtered = allCourses.filter(course => {
        return course.courseCode.toLowerCase().includes(searchTerm) || course.title.toLowerCase().includes(searchTerm)
    })

    if (sortOption === "Sort by Name (a-z)") {
        filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortOption === "Sort by Name (z-a)") {
        filtered.sort((a, b) => b.title.localeCompare(a.title))
    }

    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    const paginated = filtered.slice(start, end)

    mainSection.innerHTML = ''

    paginated.forEach(course => {
        const div = document.createElement('div')
        div.className = 'note'
        div.innerHTML = `
            <h3>${course.courseCode}</h3>
            <p>${course.description}</p>
            <a href="detail.html?id=${course.id}">Show Details</a>
        `
        mainSection.appendChild(div)
    })

    if (paginated.length === 0) {
        mainSection.innerHTML = '<p>No courses found.</p>'
    }
}

function renderPagination() {
    const paginationDiv = document.querySelector('.btn-section div:first-child')
    if (!paginationDiv) return

    let filtered = allCourses.filter(course => {
        return course.courseCode.toLowerCase().includes(searchTerm) || course.title.toLowerCase().includes(searchTerm)
    })

    const totalPages = Math.ceil(filtered.length / itemsPerPage)

    paginationDiv.innerHTML = ''

    if (totalPages > 1) {
        paginationDiv.innerHTML += `<a href="#" data-page="${currentPage > 1 ? currentPage - 1 : 1}">&laquo;</a>`
        for (let i = 1; i <= totalPages; i++) {
            paginationDiv.innerHTML += `<a href="#" data-page="${i}">${i}</a>`
        }
        paginationDiv.innerHTML += `<a href="#" data-page="${currentPage < totalPages ? currentPage + 1 : totalPages}">&raquo;</a>`
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('.create-btn a:first-child')
    const courseCodeInput = document.querySelector('input[placeholder="Enter Course Code"]')
    const courseTitleInput = document.querySelector('input[placeholder="Enter Course Title"]')
    const descriptionInput = document.querySelector('textarea')

    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.preventDefault()
            if (courseCodeInput.value.trim() === '' || courseTitleInput.value.trim() === '' || descriptionInput.value.trim() === '') {
                alert('Please fill all the fields')
            } else {
                alert('Note added successfully (but not really because we are not submitting)')
            }
        })
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('.create-btn a:first-child')
    const courseCodeInput = document.querySelector('input[placeholder="Enter Course Code"]')
    const courseTitleInput = document.querySelector('input[placeholder="Enter Course Title"]')
    const descriptionInput = document.querySelector('textarea')

    const courseCodeError = courseCodeInput.nextElementSibling
    const courseTitleError = courseTitleInput.nextElementSibling
    const descriptionError = descriptionInput.nextElementSibling

    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.preventDefault()

            let isValid = true

            if (courseCodeInput.value.trim() === '') {
                courseCodeError.style.display = 'block'
                isValid = false
            } else {
                courseCodeError.style.display = 'none'
            }

            if (courseTitleInput.value.trim() === '') {
                courseTitleError.style.display = 'block'
                isValid = false
            } else {
                courseTitleError.style.display = 'none'
            }

            if (descriptionInput.value.trim() === '') {
                descriptionError.style.display = 'block'
                isValid = false
            } else {
                descriptionError.style.display = 'none'
            }

            if (isValid) {
                alert('Note added successfully (but not really because we are not submitting)')
            }
        })
    }
})
