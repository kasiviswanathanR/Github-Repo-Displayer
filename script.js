let currentPage = 1;
const reposPerPage = 10;
const apiUrl = "https://api.github.com";
let currentUsername = "";

function searchRepos() {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();

    if (username === "") {
        alert("Please enter a GitHub username.");
        return;
    }

    currentUsername = username;
    currentPage = 1;
    fetchRepos(currentUsername, currentPage);

    document.getElementById("prevBtn").style.display = "inline-block";
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("profile-link").style.display = "inline-block";
    document.getElementById("avatar").style.display = "block";

}

function fetchRepos(username, page) {
    const userUrl = `${apiUrl}/users/${username}`;
    const reposUrl = `${apiUrl}/users/${username}/repos?page=${page}&per_page=${reposPerPage}`;

    // Fetch user details separately to get total repository count
    const userPromise = fetch(userUrl).then(response => response.json());
    const reposPromise = fetch(reposUrl).then(response => response.json());

    Promise.all([userPromise, reposPromise])
        .then(([user, repos]) => {
            displayUserInfo(user);
            displayRepos(repos);
            updatePaginationButtons(user);
            displayTotalRepos(user.public_repos);
        })
        .catch(error => {
            alert(`Error fetching data: ${error.message}`);
            console.error("Error fetching data:", error);
        });
}


function displayTotalRepos(totalRepos) {
    const totalReposElement = document.getElementById("totalRepos");
    totalReposElement.textContent = `Total Repositories: ${totalRepos}`;
}

function displayUserInfo(user) {
    const avatarElement = document.getElementById("avatar");
    const profileNameElement = document.getElementById("profile-name");
    const profileDescriptionElement = document.getElementById("profile-description");
    const profileLinkElement = document.getElementById("profile-link");

    avatarElement.src = user.avatar_url;
    profileNameElement.textContent = user.name || user.login;
    profileDescriptionElement.textContent = user.bio || "No bio available.";
    
    const githubProfileUrl = user.html_url;
    profileLinkElement.href = githubProfileUrl;
    profileLinkElement.textContent = "GitHub Profile";
}

function displayRepos(repos) {
    const reposContainer = document.getElementById("repos-container");
    reposContainer.innerHTML = "";

    repos.forEach(repo => {
        const repoElement = document.createElement("div");
        repoElement.classList.add("repo");

        const technologies = repo.language ? [repo.language] : [];
        const topics = repo.topics || [];

        const allTechnologies = [...technologies, ...topics].slice(0, 9);

        const technologiesContainer = document.createElement("div");
        technologiesContainer.classList.add("technologies-container");

        allTechnologies.forEach(tech => {
            const technologyBox = document.createElement("div");
            technologyBox.classList.add("technology-box");
            technologyBox.textContent = tech;
            technologiesContainer.appendChild(technologyBox);
        });

        repoElement.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description available."}</p>
            <div class="grid-container1">${technologiesContainer.innerHTML}</div>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>`;

        reposContainer.appendChild(repoElement);
    });
}

function updatePaginationButtons(user) {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageButtonsContainer = document.getElementById("pageButtons");

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = false;

    pageButtonsContainer.innerHTML = "";

    const totalPages = Math.ceil(user.public_repos / reposPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.classList.add("page-button");
        pageButton.textContent = i;
        pageButton.onclick = function() {
            // Update the currentPage before fetching data
            currentPage = i;
            fetchRepos(currentUsername, currentPage);
        };

        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButtonsContainer.appendChild(pageButton);
    }
}



function fetchNextPage() {
    currentPage++;
    fetchRepos(currentUsername, currentPage);
}

function fetchPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchRepos(currentUsername, currentPage);
    }
}
