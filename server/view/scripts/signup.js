
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
    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(res => {
        if (res.status == 201) {
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