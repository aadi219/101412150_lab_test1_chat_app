
function handleSignup(e) {
    e.preventDefault();
    let username = document.getElementById('username').value;
    let firstname = document.getElementById('firstname').value;
    let lastname = document.getElementById('lastname').value;
    let password = document.getElementById('password').value;
    const user = {
        username,
        firstname,
        lastname,
        password
    }
    signup(user);
}

function signup(user) {
    // make request to backend signup endpoint
    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        // pass user details in body
        body: JSON.stringify(user)
    }).then(res => {
        if (res.status == 201) {
            // if successful response -> redirect to login
            window.location.replace("http://localhost:3000/login");
        }
        else {
            alert("Error occurred while adding user! Please try again");
        }
    }).catch(err => {
        alert("Error occurred while adding user! Please try again");
        console.log(err);
    })
}