
function handleLogin(e) {
    e.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    const credentials = {username, password};
    login(credentials);

}

function login(credentials) {
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        throw new Error("Could not log-in: " + res.message);
    })
    .then(data => {
        console.log(data);
        if (!data.token) {
            throw new Error("Token not provided");
        }
        localStorage.setItem("labtest01_token", data.token);
        localStorage.setItem("labtest01_username", data.username);
        window.location.replace("http://localhost:3000/rooms");
    })
    .catch(err => {
        alert(err.message);
        console.error(err);
    })
}