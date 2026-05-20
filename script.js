
const registeredParticipants = JSON.parse(localStorage.getItem('sports_participants')) || [];
const feedbackDatabase = JSON.parse(localStorage.getItem('sports_feedbacks')) || [];

document.addEventListener("DOMContentLoaded", function () {
   
    const liveClockElement = document.getElementById('live-clock');
    if (liveClockElement) {
        function updateClock() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = now.toLocaleDateString(undefined, options);
            const timeStr = now.toLocaleTimeString();
            liveClockElement.innerText = `${dateStr} | ${timeStr}`;
        }
        setInterval(updateClock, 1000);
        updateClock();
    }

    
    const sportsForm = document.getElementById('sportsForm');
    const eventSelectElement = document.getElementById('eventSelect');
    const teamFieldsContainer = document.getElementById('teamFieldsContainer');

    if (sportsForm && eventSelectElement && teamFieldsContainer) {
        const submissionOutputCard = document.getElementById('submissionOutputCard');
        const participantDetailsDiv = document.getElementById('participantDetails');
        const totalCountSpan = document.getElementById('totalCount');

        
        if (registeredParticipants.length > 0) {
            renderParticipantTable();
            submissionOutputCard.style.display = 'block';
        }

        
        eventSelectElement.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const eventType = selectedOption.getAttribute('data-type');
            
            if (eventType === 'Team') {
                teamFieldsContainer.style.display = 'grid';
            } else {
                teamFieldsContainer.style.display = 'none';
                document.getElementById('participationTitle').value = '';
                document.getElementById('teamName').value = '';
                document.getElementById('teamSize').value = '';
            }
        });

        
        sportsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const errorBox = document.getElementById('errorBox');
            const successBox = document.getElementById('successBox');

            errorBox.style.display = 'none';
            errorBox.innerText = '';
            successBox.style.display = 'none';
            successBox.innerText = '';

            const studentName = document.getElementById('studentName').value.trim();
            const regNo = document.getElementById('regNo').value.trim();
            const emailId = document.getElementById('emailId').value.trim();
            const mobileNo = document.getElementById('mobileNo').value.trim();
            const department = document.getElementById('department').value;
            const yearOfStudy = document.getElementById('yearOfStudy').value;
            const eventIndex = eventSelectElement.selectedIndex;
            const selectedEvent = eventSelectElement.value;

            if(!studentName || !regNo || !emailId || !mobileNo || !department || !yearOfStudy || !selectedEvent) {
                showElementError(errorBox, "Error: All mandatory fields (*) must be completed before filing entry.");
                return;
            }

            if(!/^[a-zA-Z\s]{3,50}$/.test(studentName)) {
                showElementError(errorBox, "Validation Error: Student Name must contain alphabetical characters only (min 3 characters).");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(emailId)) {
                showElementError(errorBox, "Validation Error: Please provide a standard, syntactically correct Email Address.");
                return;
            }

            if(!/^\d{10}$/.test(mobileNo)) {
                showElementError(errorBox, "Validation Error: Mobile Number must be comprised of exactly 10 numerical digits.");
                return;
            }

            if(regNo.length < 5 || !/^[a-zA-Z0-9]+$/.test(regNo)) {
                showElementError(errorBox, "Validation Error: Register Number structure must contain alphanumeric parameters with no spaces.");
                return;
            }

            const chosenOption = eventSelectElement.options[eventIndex];
            const eventStatus = chosenOption.getAttribute('data-status');
            const eventType = chosenOption.getAttribute('data-type');

            if(eventStatus === 'Closed') {
                showElementError(errorBox, "Registration Blocked: The chosen event roster is filled or closed.");
                return;
            }

            let partTitle = "";
            let teamName = "";
            let teamSize = "";

            if(eventType === 'Team') {
                partTitle = document.getElementById('participationTitle').value.trim();
                teamName = document.getElementById('teamName').value.trim();
                teamSize = document.getElementById('teamSize').value.trim();

                if(!partTitle || !teamName || !teamSize) {
                    showElementError(errorBox, "Validation Error: Complete Team Title, Team Identity Name, and size variables.");
                    return;
                }

                const sizeNum = parseInt(teamSize, 10);
                if(isNaN(sizeNum) || sizeNum < 2 || sizeNum > 6) {
                    showElementError(errorBox, "Validation Error: The team distribution scope must fall inside the range boundary of 2 to 6 members.");
                    return;
                }
            }

            
            const duplicateFound = registeredParticipants.some(p => p.regNo.toLowerCase() === regNo.toLowerCase() && p.event === selectedEvent);
            if(duplicateFound) {
                showElementError(errorBox, `Duplication Detected: Register sequence "${regNo}" is already logged down for the "${selectedEvent}" scope.`);
                return;
            }

            const targetEntry = {
                studentName, regNo, emailId, mobileNo, department, yearOfStudy,
                event: selectedEvent, partTitle: partTitle || 'Individual', teamName: teamName || 'N/A', teamSize: teamSize || '1'
            };
            
            registeredParticipants.push(targetEntry);
            localStorage.setItem('sports_participants', JSON.stringify(registeredParticipants));

            successBox.innerText = "Success! Your entry configuration passed registration checkpoints.";
            successBox.style.display = 'block';

            
            renderParticipantTable();
            submissionOutputCard.style.display = 'block';

            sportsForm.reset();
            teamFieldsContainer.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        function renderParticipantTable() {
            totalCountSpan.innerText = registeredParticipants.length;
            let tableHTML = `
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Reg No</th>
                                <th>Dept / Year</th>
                                <th>Target Event</th>
                                <th>Team Name (Size)</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            registeredParticipants.forEach(p => {
                tableHTML += `
                    <tr>
                        <td>${p.studentName}</td>
                        <td>${p.regNo}</td>
                        <td>${p.department} - Yr ${p.yearOfStudy}</td>
                        <td><strong>${p.event}</strong></td>
                        <td>${p.teamName} (${p.teamSize})</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table></div>`;
            participantDetailsDiv.innerHTML = tableHTML;
        }
    }

    
    const feedbackForm = document.getElementById('feedbackForm');
    const fbComments = document.getElementById('fbComments');

    if (feedbackForm && fbComments) {
        const charCounter = document.getElementById('charCounter');
        const feedbackSummaryCard = document.getElementById('feedbackSummaryCard');
        const feedbackSummaryContent = document.getElementById('feedbackSummaryContent');
        const avgRatingSpan = document.getElementById('avgRatingSpan');

        
        
        if (feedbackDatabase.length > 0) {
            renderFeedbackLedger();
            feedbackSummaryCard.style.display = 'block';
        }

        fbComments.addEventListener('input', function() {
            charCounter.innerText = `${this.value.length} characters entered.`;
        });

        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const feedbackError = document.getElementById('feedbackError');
            const feedbackSuccess = document.getElementById('feedbackSuccess');

            feedbackError.style.display = 'none';
            feedbackError.innerText = '';
            feedbackSuccess.style.display = 'none';
            feedbackSuccess.innerText = '';

            const name = document.getElementById('fbName').value.trim();
            const regNo = document.getElementById('fbRegNo').value.trim();
            const selectedEvent = document.getElementById('fbEvent').value;
            const ratingValue = document.getElementById('fbRating').value;
            const comments = fbComments.value.trim();

            if(!regNo || regNo.length < 5 || !/^[a-zA-Z0-9]+$/.test(regNo)) {
                showElementError(feedbackError, "Validation Error: Please provide a valid alphanumeric Register Number (min 5 characters).");
                return;
            }

            if(!selectedEvent) {
                showElementError(feedbackError, "Validation Error: Please select the event you attended.");
                return;
            }

            if(!ratingValue) {
                showElementError(feedbackError, "Validation Error: Please provide a score rating index ranging from 1 to 5.");
                return;
            }

            if(comments.length < 20) {
                showElementError(feedbackError, `Validation Error: Your comments must contain at least 20 characters. Current length: ${comments.length} characters.`);
                return;
            }

            const ratingInt = parseInt(ratingValue, 10);
            const entry = { name: name || "Anonymous Student", regNo, selectedEvent, rating: ratingInt, comments };
            
            feedbackDatabase.push(entry);
            localStorage.setItem('sports_feedbacks', JSON.stringify(feedbackDatabase));

            feedbackSuccess.innerText = "Thank you! Your feedback has been verified and registered.";
            feedbackSuccess.style.display = 'block';

            renderFeedbackLedger();
            feedbackSummaryCard.style.display = 'block';

            feedbackForm.reset();
            charCounter.innerText = "0 characters entered.";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        function renderFeedbackLedger() {
            let entriesHTML = '';
            let sum = 0;

            feedbackDatabase.forEach(fb => {
                sum += fb.rating;
                entriesHTML += `
                    <div class="history-item">
                        <p><strong>Submitter:</strong> ${fb.name} (${fb.regNo})</p>
                        <p><strong>Event:</strong> ${fb.selectedEvent} | <strong>Score Assigned:</strong> ${fb.rating}/5 Stars</p>
                        <p style="margin-top:0.4rem; color:#555;"><em>"${fb.comments}"</em></p>
                    </div>
                `;
            });

            const calculatedAvg = (sum / feedbackDatabase.length).toFixed(1);
            feedbackSummaryContent.innerHTML = entriesHTML;
            avgRatingSpan.innerText = calculatedAvg;
        }
    }

    function showElementError(targetBox, msg) {
        targetBox.innerText = msg;
        targetBox.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});