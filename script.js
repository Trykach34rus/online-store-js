const productTemplate = document.querySelector('.product-template')
const filterTemplate = document.querySelector('.filter-template')
const filters = document.querySelector('.filters')
const products = document.querySelector('.products')
const selectSort = document.querySelector('.sort')
const search = document.querySelector('.search')
const cartBtn = document.querySelector('.cart-btn')
const cartCount = document.querySelector('.cart-count')
const modal = document.querySelector('.modal')
const modalClose = document.querySelector('.modal-close')
const modalCount = document.querySelector('.modal-count')
const modalBody = document.querySelector('.modal-body')
const cartTemplate = document.querySelector('.cart-template')
const modalPriceElement = document.querySelector('.modal-price')
const modalBtn = document.querySelector('.modal-btn')
const sortValues = {
	0: {
		name: 'id',
		order: 'asc',
	},
	1: {
		name: 'price',
		order: 'asc',
	},
	2: {
		name: 'title',
		order: 'asc',
	},
	3: {
		name: 'rating',
		order: 'desc',
	},
}
let activeFilter
let activeSort = sortValues['0']
let productsArray = []
let cartArray = []

fetch('https://dummyjson.com/products/categories')
	.then(response => {
		return response.json()
	})
	.then(data => {
		console.log(data.slice(0, 5))
		console.log(data[0])
		activeFilter = data[0].slug
		getProductsWithFilters(data[0].slug, activeSort)
		renderFilters(data.slice(0, 5))
	})
	.catch(error => {
		console.log(error)
	})

function getProductsWithFilters(category, sort) {
	fetch(
		`https://dummyjson.com/products/category/${category}?sortBy=${sort.name}&order=${sort.order}`
	)
		.then(response => {
			return response.json()
		})
		.then(data => {
			console.log(data)
			renderProduct(data.products)
			productsArray = data.products
		})
		.catch(error => {
			console.log(error)
		})
}

function renderFilters(data) {
	data.forEach(item => {
		const clone = filterTemplate.content.cloneNode(true)
		const filterBtn = clone.querySelector('.filter-btn')
		filterBtn.onclick = () => {
			const activeBtn = document.querySelector('.filter-btn-active')
			activeBtn.classList.remove('filter-btn-active')
			filterBtn.classList.add('filter-btn-active')
			activeFilter = item.slug
			getProductsWithFilters(item.slug, activeSort)
		}

		filterBtn.innerHTML = item.name
		filters.append(clone)
	})

	const firstBtn = document.querySelector('.filter-btn')
	firstBtn.classList.add('filter-btn-active')
}

function renderProduct(data) {
	products.innerHTML = null
	data.forEach(item => {
		const clone = productTemplate.content.cloneNode(true)
		const productBtn = clone.querySelector('.product-btn')
		const productName = clone.querySelector('.product-name')
		const productPrice = clone.querySelector('.product-price')
		const productImg = clone.querySelector('.product-img')
		const productDescription = clone.querySelector('.product-description')
		productName.textContent = item.title
		productPrice.textContent = item.price.toFixed(2) + ' $'
		productImg.src = item.images[0]
		productDescription.textContent = item.description
		productBtn.onclick = () => addToCart(item)
		products.append(clone)
	})
}
function changeSort() {
	const selectValue = selectSort.value
	console.log(sortValues[selectValue])
	activeSort = sortValues[selectValue]
	getProductsWithFilters(activeFilter, activeSort)
}
function handleSearch() {
	const value = search.value
	const filterProducts = productsArray.filter(
		item =>
			item.title.toLowerCase().includes(value.toLowerCase()) ||
			item.description.toLowerCase().includes(value.toLowerCase())
	)
	renderProduct(filterProducts)
}
function addToCart(item) {
	const itemInCart = cartArray.find(cartItem => item.id === cartItem.id)
	if (itemInCart) {
		itemInCart.count++
	} else {
		item.count = 1
		cartArray.push(item)
	}
	updateCartDisplay()
	console.log(cartArray)
}

function updateCartDisplay() {
	const cartContent = cartArray.reduce(
		(accumulator, item) => accumulator + item.count,
		0
	)
	cartCount.textContent = cartContent
	modalCount.textContent = cartContent
}
function openModal() {
	modal.classList.add('modal-active')
	updateCartDisplay()
	renderCart()
}
function closeModal() {
	modal.classList.remove('modal-active')
}
function renderCart() {
	modalBody.innerHTML = null
	cartArray.forEach(item => {
		const clone = cartTemplate.content.cloneNode(true)
		const modalName = clone.querySelector('.modal-name')
		const modalImg = clone.querySelector('.modal-img')
		const modalItemPrice = clone.querySelector('.modal-item-price')
		const modalItemCount = clone.querySelector('.modal-item-count')
		const modalPlusBtn = clone.querySelector('.modal-plus')
		const modalMinusBtn = clone.querySelector('.modal-minus')
		const modalDeleteBtn = clone.querySelector('.modal-delete')
		modalName.textContent = item.title
		modalImg.src = item.images[0]
		modalItemPrice.textContent = item.price.toFixed(2) + '$'
		modalItemCount.textContent = item.count
		modalMinusBtn.disabled = item.count === 1
		modalPlusBtn.onclick = () => {
			increasingItemCount(item.id)
			renderCart()
		}
		modalMinusBtn.onclick = () => {
			reduceItemCount(item.id)
			renderCart()
		}
		modalDeleteBtn.onclick = () => {
			removeItemCount(item.id)
			renderCart()
		}

		modalBody.append(clone)
	})

	const totalPrice = fullPrice()
	modalPriceElement.textContent = totalPrice.toFixed(2) + '$'
}
function fullPrice() {
	const modalPrice = cartArray.reduce(
		(accumulator, item) => accumulator + item.price * item.count,
		0
	)
	return modalPrice
}
function increasingItemCount(itemId) {
	const itemInCart = cartArray.find(cartItem => cartItem.id === itemId)
	if (itemInCart) {
		itemInCart.count++
	} else {
		console.log('Товар не найден в корзине')
	}
	updateCartDisplay()
}
function reduceItemCount(itemId) {
	const itemInCart = cartArray.find(cartItem => cartItem.id === itemId)
	if (itemInCart) {
		itemInCart.count--
	} else {
		console.log('Товар не найден в корзине')
	}
	updateCartDisplay()
}
function removeItemCount(itemId) {
	cartArray = cartArray.filter(cartItem => cartItem.id !== itemId)
	updateCartDisplay()
}

function purchaseItem() {
	if (cartArray.length === 0) {
		alert('Корзина пуста')
		return
	}
	alert('Заказ передан в сборку')
	cartArray = []
	updateCartDisplay()
	closeModal()
	renderCart()
}

search.oninput = handleSearch
selectSort.onchange = changeSort
cartBtn.onclick = openModal
modalClose.onclick = closeModal
modalBtn.onclick = purchaseItem
