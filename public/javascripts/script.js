

let img = []
let singleImage


$(document).ready(function () {
    $(".qty-inc").on("click", function () {
        let productId = $(this).data("product-id");
        updateQty(productId, "increase");
    });

    $(".qty-dec").on("click", function () {
        let productId = $(this).data("product-id");
        updateQty(productId, "decrease");
    });


});





const inputFields = document.querySelectorAll('.profile-details');
const submitButton = document.getElementById('profile-submit');

inputFields.forEach(input => {
    input.addEventListener('input', () => {
        submitButton.style.display = 'block';
    });
});



function remWishlist(id) {
    // console.log(id, "This is the id and thuis function is being called");
    fetch(`/user/rem-wishlist/${id}`, {
        method: 'DELETE',
    }).then(() => {

        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function addWishlist(id) {

    fetch(`/user/add-wishlist/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function addCart(id) {

    fetch(`/user/add-cart/${id}`, {
        method: 'PATCH',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function removeCart(id) {

    fetch(`/user/rem-cart/${id}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function updateQty(productId, action) {
    $.ajax({
        url: "/user/cart/update-qty",
        method: "PATCH",
        data: { productId: productId, action: action },
        success: (response) => {
            if (response.quantity < 1) {
                return removeCart(productId)
            } else {
                $(".quantity[data-product-id='" + productId + "']").val(response.quantity);
                $(".priceForQty[data-product-id='" + productId + "']").text("₹" + response.total_prize + "/-")
                console.log("Cart updated successfully.");
            }
        },
        error: function (error) {
            console.error("Error updating cart: ", error);
        }
    });
}
function removeAddress(id) {
    fetch(`/user/rem-address/${id}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error remove address:', error);
    });
}
function checkout() {
    window.location.href = `/user/checkout`
}
function resendOTP() {
    const email = document.getElementById("email").value
    window.location.href = `/resend-otp?email=${email}`
}
function forgetPass() {
    const email = document.getElementById("email").value
    window.location.href = `/forgetpassword?email=${email}`
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
        document.getElementById("product_image1").src = product.prd_images[0];
        document.getElementById("product_image2").src = product.prd_images[1];
        document.getElementById("product_image3").src = product.prd_images[2];
        document.getElementById("product_image4").src = product.prd_images[3];
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
        window.location.href = '#product-category'
    } catch (error) {
        console.log(error.message);
    }

}
function cancelOrder(id) {

    window.location.href = `/user/cancel-order?order=${id}`

}
function cancelOrderAsAdmin(id) {


    window.location.href = `/admin/orders-management/cancel-order?order=${id}`

}
function updateOrderStatus(orderId, newStatus) {
    fetch(`/admin/update-order-status/${orderId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
    })
        .then(response => response.json())
        .then(data => {
            window.location.reload()
        })
        .catch(error => {
            console.error("Error updating order status:", error);
        });
}

const statusSelects = document.querySelectorAll(".status-select");
statusSelects.forEach(select => {
    select.addEventListener("change", function () {
        const orderId = this.getAttribute("data-order-id");
        const newStatus = this.value;
        updateOrderStatus(orderId, newStatus);
    });
});
function returnOrder(id) {

    window.location.href = `/user/return-order?order=${id}`

}
function selectAddress(address) {
    console.log(address);
    try {
        const addressDetails = JSON.parse(address)
        document.getElementById("local_address").value = addressDetails.locality
        document.getElementById("country").value = addressDetails.country
        document.getElementById("district").value = addressDetails.district
        document.getElementById("state").value = addressDetails.state
        document.getElementById("city").value = addressDetails.city
        document.getElementById("altr_number").value = addressDetails.altr_number
        document.getElementById("postcode").value = addressDetails.postcode
        document.getElementById("address_id").value = addressDetails._id
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
        const modal = new bootstrap.Modal(document.getElementById("adminMessageModal"));
        const modalMessage = document.getElementById("modalAdminMessage");
        modalMessage.textContent = "Enter new Category..";
        modal.show();
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


async function uploadImage(file, id) {
    for (const index in file) {
        const formData = new FormData()

        formData.append("file", file[index])

        let a = await fetch("/admin/products-management/uploadImage", {
            method: "POST",
            body: formData
        }).then((res => {
            return res.json()
        }))

        img.push(a)

    }

}
function removeImage(index) {
    const prd = document.getElementById('product_id').value
    const image = document.getElementById(`product_image${index}`).src
    if (prd) {
        fetch(`/admin/products-management/remove-image`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prd_id: prd, image })
        }).then(() => {
            window.location.reload()
        }).catch(error => {
            console.error('Error deleting image:', error);
        })
    }
}
async function uploadBannerImage(file, id) {

    const formData = new FormData()

    formData.append("file", file[0])
    console.log(file[0]);
    let result = await fetch("/admin/create-banner/uploadImage", {
        method: "POST",
        body: formData
    }).then((res => {
        return res.json()
    }))

    singleImage = result



}
function validateCreateBanner() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;

    // Add other validation rules as needed


    let data = {
        title,
        banner: singleImage,
        category,
    }

    fetch("/admin/create-banner", {
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
function removeBanner(id) {
    fetch(`/admin/delete-banner/${id}`, {
        method: 'DELETE',
    }).then(() => {
        window.location.reload()
    }).catch((error) => {
        console.error('Error deleting product:', error);
        // Optionally handle error and show error message to the user
    });
}
function confirmOrder() {

    $.ajax({
        url:"/user/confirm-order",
        method:"POST",
        data:$('#checkoutForm').serialize(),
        success:function(res){
            if(res.codSuccess){
                window.location.href="/user/orders?message=Order has been confirmed"
            }else if(res.razorSuccess){
                const order={
                    "key":""+res.key_id+"",
                    "amount":""+res.amount+"",
                    "currency":"INR",
                    "name":""+res.name+"",
                    "prefill":{
                        "contact":""+res.contact+"",
                        "name":""+res.name+"",
                        "email":""+res.email+""
                    },
                    "handler":function (response){
                        alert("paymentDone")
                        verifyPayment(response,res)
                    } 
                }
                
                const razorpay = new Razorpay(order);

                const done=razorpay.open();
                
            }else{
                window.location.href=`/user/checkout?message=${res.msg}`
            }
        },
        error:function(err){
            console.log(err);
        }
    })
}
function verifyPayment(res,order){
 

    $.ajax({
        url:"/user/checkout/verify-payment",
        method:"POST",
        data:{res,order},
        success:function(){
            window.location.href="/user/orders?message=Payment Successfull!,Order has been confirmed"
        }
    })
}

function confirms(event, fn) {
    let modal = new bootstrap.Modal(document.getElementById("confirmationModal"));

    event.preventDefault();
    modal.show();

    let confirmButton = document.getElementById("confirmButton");

    confirmButton.addEventListener("click", function () {
        modal.hide();
        fn();
    });

    let cancelButton = document.querySelector("#confirmationModal .btn-secondary");
    cancelButton.addEventListener("click", function () {
        modal.hide();
    });
}

function confirmsUser(event, fn) {
    let modal = new bootstrap.Modal(document.getElementById("confirmationModalUser"));

    event.preventDefault();
    modal.show();

    let confirmButton = document.getElementById("confirmButton");

    confirmButton.addEventListener("click", function () {
        modal.hide();
        fn();
    });

    let cancelButton = document.querySelector("#confirmationModalUser .btn-secondary");
    cancelButton.addEventListener("click", function () {
        modal.hide();
    });
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Display the alert box with the message from the 'message' query parameter
window.addEventListener('load', function () {
    let message
    let adminMessage
    if (getQueryParam('CreatedAccount')) { message = getQueryParam('CreatedAccount'); }
    else if (getQueryParam('UserLogged')) { message = getQueryParam('UserLogged'); }
    else if (getQueryParam('message')) { message = getQueryParam('message') }
    else if (getQueryParam('adminMessage')) { adminMessage = getQueryParam('adminMessage') }
    if (message) {
        const modal = new bootstrap.Modal(document.getElementById("myModal"));
        const modalMessage = document.getElementById("modalMessage");
        modalMessage.textContent = message;
        modal.show();
    } else if (adminMessage) {
        const modal = new bootstrap.Modal(document.getElementById("adminMessageModal"));
        const modalMessage = document.getElementById("modalAdminMessage");
        modalMessage.textContent = adminMessage;
        modal.show();
    }
});

deactivateLink.addEventListener("click", function (event) {
    let confirmationModalUser = new bootstrap.Modal(document.getElementById("confirmationModalUser"));
    let confirmButton = document.getElementById("confirmButton");
    let deactivateLink = document.getElementById("deactivateLink");
    event.preventDefault();
    confirmationModalUser.show();

    confirmButton.addEventListener("click", function () {

        confirmationModalUser.hide();
        window.location.href = deactivateLink.getAttribute("href");
    });

    let cancelButton = document.querySelector("#confirmationModalUser .btn-secondary");
    cancelButton.addEventListener("click", function () {
        confirmationModalUser.hide();
    });
});