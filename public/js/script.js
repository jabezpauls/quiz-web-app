document.addEventListener("DOMContentLoaded", () => {
    let quizContainer = document.getElementById("quiz-container");
    let submitButton = document.getElementById("submitQuiz");
    let scoreDisplay = document.getElementById("score");
    let userAnswers = [];
  
    // Fetch quiz questions from the JSON file
    fetch("/js/questions.json")
      .then(response => response.json())
      .then(data => {
        data.forEach((questionObj, index) => {
          let questionDiv = document.createElement("div");
  
          let questionTitle = document.createElement("h3");
          questionTitle.innerText = questionObj.question;
          questionDiv.appendChild(questionTitle);
  
          questionObj.options.forEach(option => {
            let optionLabel = document.createElement("label");
            let optionInput = document.createElement("input");
            optionInput.type = "radio";
            optionInput.name = `question${index}`;
            optionInput.value = option;
  
            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(document.createTextNode(option));
            questionDiv.appendChild(optionLabel);
            questionDiv.appendChild(document.createElement("br"));
          });
  
          quizContainer.appendChild(questionDiv);
        });
      });
  
    // Handle quiz submission
    submitButton.addEventListener("click", () => {
      fetch("/js/questions.json")
        .then(response => response.json())
        .then(data => {
          let score = 0;
          
          data.forEach((questionObj, index) => {
            let selectedAnswer = document.querySelector(`input[name="question${index}"]:checked`);
            
            if (selectedAnswer && selectedAnswer.value === questionObj.correctAnswer) {
              score++;
            }
          });
  
          // Show the score to the user
          scoreDisplay.innerText = `Your score: ${score}/${data.length}`;
          
          // Update score in the DB
          updateScoreInDB(score);
        });
    });
  
    // Function to update the score in the DB
    function updateScoreInDB(score) {
      fetch("/update-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token")  // Assuming the token is stored in localStorage
        },
        body: JSON.stringify({ score })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Score updated:", data);
      })
      .catch(error => console.error("Error updating score:", error));
    }
  });

  async function fetchDashboardData() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch("/dashboard", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('usernameDisplay').innerText = data.username;
            document.getElementById('scoreDisplay').innerText = data.score;
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to fetch dashboard data");
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        alert("An error occurred while fetching dashboard data");
    }
}

// Call the function to fetch user data


  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and username in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username); // Optional if you want to display username
                window.location.href = "/dashboard.html"; // Redirect to dashboard
            } else {
                // Display error message
                errorMessage.innerText = data.message || "Login failed. Please try again.";
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessage.innerText = "Something went wrong. Please try again.";
        }
    });
});
  document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const signupErrorMessage = document.getElementById("signupErrorMessage");
  
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      try {
        const response = await fetch("/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Redirect to login page after successful signup
          window.location.href = "/login.html";
        } else if (signupErrorMessage) {
          signupErrorMessage.innerText = data.message || "Signup failed. Please try again.";
        }
      } catch (error) {
        console.error("Error:", error);
        if (signupErrorMessage) {
          signupErrorMessage.innerText = "Something went wrong. Please try again.";
        }
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const quizForm = document.getElementById("quizForm");
    const scoreDisplay = document.getElementById("scoreDisplay");

    quizForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Assuming you have a way to calculate the score based on the quiz answers
        const score = calculateScore(); // Implement your score calculation logic here

        // Send score to server
        try {
            const response = await fetch("/update-score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ score })
            });

            const data = await response.json();

            if (response.ok) {
                // Update the score display
                scoreDisplay.innerText = `Your score: ${data.updatedScore}`;
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error updating score:", error);
        }
    });

    function calculateScore() {
        // Example logic for calculating score
        let score = 0;
        const answers = document.querySelectorAll('input[type="radio"]:checked');
        answers.forEach(answer => {
            if (answer.value === "correct") {
                score += 1;
            }
        });
        return score;
    }
});

  