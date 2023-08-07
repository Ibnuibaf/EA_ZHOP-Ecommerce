

let img = []



function remWishlist(id) {
    // console.log(id, "This is the id and thuis function is being called");
    fetch(`/user/products/product-details/rem-wishlist/${id}`, {
        method: 'DELETE',
    }).then(() => {

        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function addWishlist(id) {

    fetch(`/user/products/product-details/add-wishlist/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function filter(from, to, cat) {
    window.location.href = `/user/products?min=${from}&max=${to}&category=${cat}`
}
function categorize(category) {
    window.location.href = `/user/products?category=${category}`
}
function searchPrd(category) {
    const query = document.getElementById("search").value
    window.location.href = `/user/products?category=${category}&search=${query}`
}
function blockUser(id) {
    fetch(`/admin/users-management/block-user/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}
function unblockUser(id) {
    fetch(`/admin/users-management/unblock-user/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}
function deleteUser(id) {
    fetch(`/admin/users-management/delete-user/${id}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
    });
}
function searchUser() {
    const query = document.getElementById("search").value
    window.location.href = `/admin/users-management?search=${query}`
}
function searchProduct() {
    const query = document.getElementById("search").value
    window.location.href = `/admin/products-management?search=${query}`
}
function deactivateProduct(id) {
    fetch(`/admin/products-management/deactive/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}
function activateProduct(id) {
    fetch(`/admin/products-management/active/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}
function editProduct(prd) {
    try {
        const product = JSON.parse(prd); // Parse the JSON string back to an object

        document.getElementById("product_id").value = product._id;
        document.getElementById("product_name").value = product.prd_name;
        document.getElementById("product_desc").value = product.description;
        document.getElementById("additional_info").value = product.additional_info;
        document.getElementById("product_purchase").value = product.purchase;
        const productCategorySelect = document.getElementById('product_category');
        [...productCategorySelect.options].forEach((option) => {
            console.log(product.category);
            if (option.value === product.category) {
                option.selected = true;
                return; // Exit the loop once the selected option is set
            }
        });
        document.getElementById("product_stock").value = product.stock;
        document.getElementById("product_mrp").value = product.mrp;
        document.getElementById("product_discount").value = product.discount;
    } catch (error) {
        console.log(error.message);
    }

}

function deactivateCategory(id) {
    fetch(`/admin/products-management/deactiveCategory/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}
function activateCategory(id) {
    fetch(`/admin/products-management/activeCategory/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error blocking User:', error);
        // Optionally handle error and show error message to the user
    });
}

function validateCategoryForm() {
    const cat_name = document.getElementById('cat_name').value;
    if (cat_name.trim() === '') {
        alert("Enter new Category..")
        return false
    }
}
function validatePrdForm() {
    const prd_name = document.getElementById('product_name').value;
    const prd_desc = document.getElementById('product_desc').value;
    const prd_id = document.getElementById('product_id').value;
    const prd_purchase = document.getElementById('product_purchase').value;
    const prd_addinfo = document.getElementById('additional_info').value;
    const prd_category = document.getElementById('product_category').value;
    const prd_stock = document.getElementById('product_stock').value;
    const prd_mrp = document.getElementById('product_mrp').value;
    const prd_discount = document.getElementById('product_discount').value;

    // Add other validation rules as needed


    let data = {
        prd_id,
        prd_name,
        prd_desc,
        prd_purchase,
        prd_addinfo,
        prd_category,
        prd_stock,
        prd_mrp,
        prd_discount,
        prd_images: img
    }

    fetch("/admin/products-management/update-prd", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(() => {

        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    })

}

function editCategory(cat) {
    try {
        const category = JSON.parse(cat); // Parse the JSON string back to an object

        document.getElementById("cat_id").value = category._id;
        document.getElementById("cat_name").value = category.name;

    } catch (error) {
        console.log(error.message);
    }

}

function confirms(event, fn) {
    event.preventDefault();
    alert("The Specified action is Done.!");
    fn()
}
async function uploadImage(file, id) {
    console.log(file);
    const formData = new FormData()

    formData.append("file", file)

    let a = await fetch("/admin/products-management/uploadImage", {
        method: "POST",
        body: formData
    }).then((res => {
        return res.json()
    }))

    img.push(a)

    console.log(img);

}
function submitImg() {
    fetch()
}
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Display the alert box with the message from the 'message' query parameter
window.addEventListener('load', function () {
    let message
    if(getQueryParam('CreatedAccount')){ message = getQueryParam('CreatedAccount');}
    else if(getQueryParam('UserLogged')){message = getQueryParam('UserLogged');}
    else if(getQueryParam('message')){message = getQueryParam('message')}
    if (message) {
        alert(message);
    }
});