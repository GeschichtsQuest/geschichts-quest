document.addEventListener('DOMContentLoaded', () => {
    console.log("=== GLOBAL SCRIPT: DOMContentLoaded event fired. ===");

    // --- HELPER FUNKTIONEN ---
    const getElementById = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`CRITICAL ERROR: Element with ID '${id}' not found on ${window.location.pathname}!`);
        }
        return element;
    };

    const showFeedback = (element, message, isError = false) => {
        if (element) {
            element.textContent = message;
            element.className = 'feedback';
            if (isError) {
                element.classList.add('incorrect');
            } else {
                element.classList.add('correct');
            }
            element.classList.remove('hidden');
            setTimeout(() => {
                element.classList.add('hidden');
            }, 3000);
        }
    };

    // --- BENUTZERVERWALTUNG (LocalStorage-basiert) ---
    const usersKey = 'geschichtsquest_users';
    const currentUserKey = 'geschichtsquest_currentUser';
    const selectedChapterKey = 'geschichtsquest_selectedChapter';
    const quizProgressKey = 'geschichtsquest_quizProgress'; // Speichert alle Quiz-Ergebnisse
    const userSettingsKey = 'geschichtsquest_userSettings'; // Speichert zusätzliche Nutzereinstellungen wie Zähler für Namensänderungen

    const getUsers = () => {
        const users = localStorage.getItem(usersKey);
        return users ? JSON.parse(users) : {};
    };

    const saveUsers = (users) => {
        localStorage.setItem(usersKey, JSON.stringify(users));
    };

    const getCurrentUser = () => {
        const user = localStorage.getItem(currentUserKey);
        return user ? JSON.parse(user) : null;
    };

    const setCurrentUser = (user) => {
        if (user) {
            localStorage.setItem(currentUserKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(currentUserKey);
        }
    };

    const setSelectedChapter = (chapterId) => {
        localStorage.setItem(selectedChapterKey, chapterId);
    };

    const getSelectedChapter = () => {
        return localStorage.getItem(selectedChapterKey);
    };

    // Funktion zum Abrufen des Quiz-Fortschritts für einen bestimmten Nutzer, Kapitel und Quiz-Typ
    const getQuizProgress = (username, chapterId, quizType) => {
        const allProgress = JSON.parse(localStorage.getItem(quizProgressKey) || '{}');
        if (!allProgress[username]) allProgress[username] = {};
        if (!allProgress[username][chapterId]) allProgress[username][chapterId] = {};
        if (!allProgress[username][chapterId][quizType]) {
            allProgress[username][chapterId][quizType] = { correct: 0, totalAsked: 0 }; // Removed questionIndices as they are not used for stats
        }
        return allProgress[username][chapterId][quizType];
    };

    // Funktion zum Aktualisieren des Quiz-Fortschritts
    const updateQuizProgress = (username, chapterId, quizType, correct, totalAsked) => {
        const allProgress = JSON.parse(localStorage.getItem(quizProgressKey) || '{}');
        if (!allProgress[username]) allProgress[username] = {};
        if (!allProgress[username][chapterId]) allProgress[username][chapterId] = {};
        allProgress[username][chapterId][quizType] = { correct, totalAsked };
        localStorage.setItem(quizProgressKey, JSON.stringify(allProgress));
        console.log(`DEBUG: Quiz Progress updated for ${username}, ${chapterId}, ${quizType}: ${correct}/${totalAsked}`);
    };

    // --- Benutzer-Einstellungen (für Namens- und Passwortänderungszähler) ---
    const getUserSettings = (username) => {
        const settings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
        if (!settings[username]) {
            settings[username] = {
                nameChanges: { count: 0, lastReset: Date.now() }, // Count reset monthly
                passwordChangedThisMonth: false, // Reset monthly
                passwordLastChange: Date.now() // Timestamp of last password change
            };
            localStorage.setItem(userSettingsKey, JSON.stringify(settings));
        }
        // Check for monthly reset
        const now = new Date();
        const lastResetDate = new Date(settings[username].nameChanges.lastReset);

        if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
            console.log("DEBUG: Monthly reset for user settings initiated.");
            settings[username].nameChanges.count = 0;
            settings[username].nameChanges.lastReset = Date.now();
            settings[username].passwordChangedThisMonth = false;
            localStorage.setItem(userSettingsKey, JSON.stringify(settings));
        }
        return settings[username];
    };

    const saveUserSettings = (username, userSetting) => {
        const allSettings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
        allSettings[username] = userSetting;
        localStorage.setItem(userSettingsKey, JSON.stringify(allSettings));
    };

    // --- DATENSTRUKTUR FÜR GESCHICHTSINHALTE ---
    const historyContent = [
        // NEUES KAPITEL: Deutsche Reichsgründung
        {
            id: "deutsche_reichsgruendung",
            title: "Deutsche Reichsgründung (1871)",
            learnContent: `
                <h3>Vom Deutschen Bund zum Kaiserreich</h3>
                <p>Nach dem Zerfall des Heiligen Römischen Reiches Deutscher Nation und den Befreiungskriegen bestand Deutschland aus vielen Einzelstaaten, die im Deutschen Bund lose verbunden waren. Preußen und Österreich waren die größten Mächte. Ab Mitte des 19. Jahrhunderts wuchs der Wunsch nach einem geeinten deutschen Nationalstaat.</p>
                <img src="images/deutscher_bund_karte.jpg" alt="Karte des Deutschen Bundes" class="content-image">
                <p class="image-caption">Karte des Deutschen Bundes (ca. 1815-1866)</p>

                <h3>Otto von Bismarck und die Einigungskriege</h3>
                <p>Die zentrale Figur der Reichsgründung war der preußische Ministerpräsident <strong>Otto von Bismarck</strong>. Er verfolgte eine "Blut und Eisen"-Politik, was bedeutete, dass er die deutsche Einheit durch Kriege erreichen wollte. Dies führte zu drei entscheidenden Einigungskriegen:</p>
                <ul>
                    <li><strong>Deutsch-Dänischer Krieg (1864):</strong> Preußen und Österreich besiegten Dänemark.</li>
                    <li><strong>Deutscher Krieg (1866):</strong> In diesem Krieg besiegte Preußen **Österreich**, löste den Deutschen Bund auf und gründete den Norddeutschen Bund unter preußischer Führung.</li>
                    <li><strong>Deutsch-Französischer Krieg (1870/71):</strong> Dieser Krieg gegen **Frankreich** führte zur nationalen Begeisterung in Süddeutschland, die zum Beitritt zum Norddeutschen Bund führte.</li>
                </ul>
                <img src="images/otto_von_bismarck.jpg" alt="Otto von Bismarck" class="content-image">
                <p class="image-caption">Otto von Bismarck, Architekt der Reichsgründung</p>

                <h3>Die Kaiserproklamation in Versailles</h3>
                <p>Am <strong>18. Januar 1871</strong> wurde im <strong>Spiegelsaal von Versailles</strong>, dem ehemaligen Herrschaftssitz der französischen Könige, der preußische König <strong>Wilhelm I.</strong> zum Deutschen Kaiser proklamiert. Damit war das <strong>Deutsche Kaiserreich</strong> gegründet, eine konstitutionelle Monarchie unter preußischer Hegemonie. Bismarck wurde der erste Reichskanzler und prägte die Politik des neuen Reiches maßgeblich.</p>
                <img src="images/kaiserproklamation_versailles.jpg" alt="Kaiserproklamation in Versailles" class="content-image">
                <p class="image-caption">Die Proklamation Wilhelms I. zum Deutschen Kaiser in Versailles, 1871</p>
                `,
            flashcards: [
                { front: "Zentrale Figur der Reichsgründung?", back: "Otto von Bismarck" },
                { front: "Bismarcks Politik zur Einigung?", back: "Blut und Eisen" },
                { front: "Krieg 1866: Preußen gegen ...?", back: "Österreich" },
                { front: "Krieg 1870/71 gegen ...?", back: "Frankreich" },
                { front: "Datum der Kaiserproklamation?", back: "18. Januar 1871" },
                { front: "Ort der Kaiserproklamation?", back: "Versailles" }
            ],
            quizQuestions: [
                {
                    question: "Wer war die zentrale politische Figur bei der Gründung des Deutschen Reiches?",
                    type: "short-answer",
                    correctAnswer: "Otto von Bismarck",
                    acceptableAnswers: ["bismarck", "otto bismarck", "otto von bismarck"],
                    feedbackCorrect: "Richtig! Otto von Bismarck war der 'Eiserne Kanzler'.",
                    feedbackIncorrect: "Falsch. Die Antwort ist Otto von Bismarck."
                },
                {
                    question: "Mit welchem Krieg begann die Reihe der Einigungskriege Preußens?",
                    type: "multiple-choice",
                    options: ["Deutsch-Französischer Krieg", "Deutscher Krieg", "Deutsch-Dänischer Krieg", "Siebenjähriger Krieg"],
                    correctAnswer: "Deutsch-Dänischer Krieg",
                    feedbackCorrect: "Korrekte Antwort! Der Deutsch-Dänische Krieg war der erste Schritt.",
                    feedbackIncorrect: "Leider falsch. Es war der Deutsch-Dänische Krieg."
                },
                {
                    question: "Welches Reich wurde am 18. Januar 1871 gegründet?",
                    type: "short-answer",
                    correctAnswer: "Deutsches Kaiserreich",
                    acceptableAnswers: ["deutsches kaiserreich", "kaiserreich", "deutsches reich"],
                    feedbackCorrect: "Genau! Das Deutsche Kaiserreich entstand in Versailles.",
                    feedbackIncorrect: "Falsch. Es war das Deutsche Kaiserreich."
                },
                {
                    question: "In welchem Gebäude wurde der deutsche Kaiser proklamiert?",
                    type: "multiple-choice",
                    options: ["Berliner Schloss", "Reichstagsgebäude", "Spiegelsaal von Versailles", "Sanssouci"],
                    correctAnswer: "Spiegelsaal von Versailles",
                    feedbackCorrect: "Exzellent! Ein symbolträchtiger Ort.",
                    feedbackIncorrect: "Leider falsch. Es war der Spiegelsaal von Versailles."
                },
                {
                    question: "Wie nannte man Bismarcks Politik zur Durchsetzung der nationalen Einheit?",
                    type: "short-answer",
                    correctAnswer: "Blut und Eisen",
                    acceptableAnswers: ["blut und eisen politik", "blut und eisen"],
                    feedbackCorrect: "Richtig! Eine sehr realpolitische Herangehensweise.",
                    feedbackIncorrect: "Nicht ganz. Es war die 'Blut und Eisen'-Politik."
                },
                {
                    question: "Welcher Krieg führte zur Auflösung des Deutschen Bundes und zur Gründung des Norddeutschen Bundes?",
                    type: "multiple-choice",
                    options: ["Deutsch-Dänischer Krieg", "Deutscher Krieg", "Deutsch-Französischer Krieg", "Napoleonische Kriege"],
                    correctAnswer: "Deutscher Krieg",
                    feedbackCorrect: "Korrekt! Preußen besiegte Österreich in diesem Konflikt.",
                    feedbackIncorrect: "Falsch. Die Antwort ist der Deutsche Krieg."
                },
                {
                    question: "Wer wurde der erste Kaiser des neu gegründeten Deutschen Reiches?",
                    type: "short-answer",
                    correctAnswer: "Wilhelm I.",
                    acceptableAnswers: ["wilhelm der erste", "kaiser wilhelm i", "kaiser wilhelm der erste"],
                    feedbackCorrect: "Genau! König Wilhelm I. von Preußen wurde zum Kaiser.",
                    feedbackIncorrect: "Leider falsch. Es war Wilhelm I."
                }
            ]
        },
        // NEUES KAPITEL: Erster Weltkrieg
        {
            id: "erster_weltkrieg",
            title: "Erster Weltkrieg (1914-1918)",
            learnContent: `
                <h3>Ursachen und Auslöser</h3>
                <p>Der Erste Weltkrieg hatte multiple Ursachen, darunter imperialistische Rivalitäten, Wettrüsten, das europäische Bündnissystem (Triple Entente vs. Mittelmächte) und aggressive Nationalismen. Der direkte Auslöser war die <strong>Ermordung des österreichisch-ungarischen Thronfolgers Erzherzog Franz Ferdinand</strong> in <strong>Sarajevo</strong> am <strong>28. Juni 1914</strong>. Dies führte zu einer Kettenreaktion von Kriegserklärungen.</p>
                <img src="images/attentat_sarajevo.jpg" alt="Attentat von Sarajevo" class="content-image">
                <p class="image-caption">Erzherzog Franz Ferdinand kurz vor dem Attentat in Sarajevo</p>

                <h3>Verlauf und Besonderheiten</h3>
                <p>Der Krieg war hauptsächlich ein **Stellungskrieg** an der Westfront mit massiven Materialschlachten (z.B. Verdun, Somme) und dem Einsatz **neuer Waffen** wie **Maschinengewehren, Giftgas** und **Panzern**. An der Ostfront herrschte eher ein Bewegungskrieg. Der Krieg wurde auch zu einem <strong>totalen Krieg</strong>, der die gesamte Gesellschaft und Wirtschaft umfasste.</p>
                <img src="images/stellungskrieg_graben.jpg" alt="Stellungskrieg im Ersten Weltkrieg" class="content-image">
                <p class="image-caption">Soldaten in einem Schützengraben an der Westfront</p>

                <h3>Kriegsende und Folgen</h3>
                <p>Nach dem Kriegseintritt der USA 1917 und dem Zusammenbruch der Mittelmächte (Deutsches Reich, Österreich-Ungarn, Osmanisches Reich, Bulgarien) endete der Krieg. In Deutschland führte die militärische Niederlage zur <strong>Novemberrevolution</strong>, dem Sturz der Monarchie und der Ausrufung der Republik. Am <strong>11. November 1918</strong> wurde der Waffenstillstand unterzeichnet. Der <strong>Versailler Vertrag</strong> (1919) auferlegte Deutschland harte Bedingungen, die als Belastung für die spätere Weimarer Republik dienten. Die **Mittelmächte** waren Deutschland, Österreich-Ungarn, das Osmanische Reich und Bulgarien. Die **Triple Entente** bestand aus Frankreich, Großbritannien und Russland.</p>
                <img src="images/waffenstillstand_1918.jpg" alt="Unterzeichnung des Waffenstillstands 1918" class="content-image">
                <p class="image-caption">Die Unterzeichnung des Waffenstillstands von Compiègne, 11. November 1918</p>
            `,
            flashcards: [
                { front: "Direkter Auslöser des Krieges?", back: "Attentat von Sarajevo" },
                { front: "Hauptmerkmal des Krieges an der Westfront?", back: "Stellungskrieg" },
                { front: "Waffenstillstand unterzeichnet am (Datum)?", back: "11. November 1918" },
                { front: "Vertrag, der Deutschland auferlegt wurde?", back: "Versailler Vertrag" },
                { front: "Mächteblock Deutschlands?", back: "Mittelmächte" },
                { front: "Wichtige Schlacht im Westen (1916)?", back: "Verdun / Somme" }
            ],
            quizQuestions: [
                {
                    question: "Was war der direkte Auslöser des Ersten Weltkriegs?",
                    type: "short-answer",
                    correctAnswer: "Attentat von Sarajevo",
                    acceptableAnswers: ["attentat sarajevo", "ermordung franz ferdinand"],
                    feedbackCorrect: "Richtig! Das Attentat auf Franz Ferdinand war der Funke.",
                    feedbackIncorrect: "Falsch. Es war das Attentat von Sarajevo."
                },
                {
                    question: "An welchem Datum wurde der Waffenstillstand im Ersten Weltkrieg unterzeichnet?",
                    type: "multiple-choice",
                    options: ["1. September 1914", "8. Mai 1945", "11. November 1918", "30. Januar 1933"],
                    correctAnswer: "11. November 1918",
                    feedbackCorrect: "Korrekte Antwort! Der 'Elfte im Elften'.",
                    feedbackIncorrect: "Leider falsch. Es war der 11. November 1918."
                },
                {
                    question: "Wie nannte man die Hauptform der Kriegsführung an der Westfront?",
                    type: "short-answer",
                    correctAnswer: "Stellungskrieg",
                    acceptableAnswers: ["grabenkrieg", "stellungskrieg"],
                    feedbackCorrect: "Genau! Die Soldaten saßen in Schützengräben fest.",
                    feedbackIncorrect: "Falsch. Es war ein Stellungskrieg."
                },
                {
                    question: "Welches Dokument auferlegte Deutschland nach dem Krieg harte Bedingungen?",
                    type: "multiple-choice",
                    options: ["Kieler Matrosenaufstand", "Frieden von Brest-Litowsk", "Versailler Vertrag", "Dawes-Plan"],
                    correctAnswer: "Versailler Vertrag",
                    feedbackCorrect: "Exzellent! Der Versailler Vertrag war sehr umstritten.",
                    feedbackIncorrect: "Leider falsch. Es war der Versailler Vertrag."
                },
                {
                    question: "Welche Revolution führte in Deutschland am Ende des Ersten Weltkriegs zum Sturz der Monarchie?",
                    type: "short-answer",
                    correctAnswer: "Novemberrevolution",
                    feedbackCorrect: "Richtig! Die Novemberrevolution beendete die Monarchie.",
                    feedbackIncorrect: "Nicht ganz. Es war die Novemberrevolution."
                },
                {
                    question: "Welche zwei großen europäischen Bündnissysteme standen sich im Ersten Weltkrieg gegenüber?",
                    type: "multiple-choice",
                    options: ["NATO und Warschauer Pakt", "Achsenmächte und Alliierte", "Triple Entente und Mittelmächte", "Heilige Allianz und Quadruple-Allianz"],
                    correctAnswer: "Triple Entente und Mittelmächte",
                    feedbackCorrect: "Korrekt! Ein komplexes Bündnissystem trug zum Konflikt bei.",
                    feedbackIncorrect: "Falsch. Die Antwort ist Triple Entente und Mittelmächte."
                },
                 {
                    question: "Was war eine wichtige neue Waffe im Ersten Weltkrieg, die große Schrecken verbreitete?",
                    type: "short-answer",
                    correctAnswer: "Giftgas",
                    acceptableAnswers: ["gas", "giftgas", "panzer", "maschinengewehr"],
                    feedbackCorrect: "Sehr gut! Giftgas war eine furchtbare Neuerung.",
                    feedbackIncorrect: "Falsch. Neue Waffen waren z.B. Giftgas, Panzer oder Maschinengewehre."
                }
            ]
        },
        {
            id: "weimarer_republik",
            title: "Weimarer Republik (1918-1933)",
            learnContent: `
                <h3>Entstehung und Herausforderungen</h3>
                <p>Nach dem Ersten Weltkrieg und der Novemberrevolution wurde 1918 die parlamentarische Demokratie in Deutschland ausgerufen. Die Verfassung wurde 1919 in <strong>Weimar</strong> verabschiedet, daher der Name "Weimarer Republik". Erster Reichspräsident war **Friedrich Ebert**. Sie stand von Beginn an vor enormen Herausforderungen: den Belastungen des **Versailler Vertrags**, politischen Extremismus von links und rechts, und einer verheerenden <strong>Hyperinflation</strong> im Jahr 1923.</p>
                <img src="images/friedrich_ebert.jpg" alt="Friedrich Ebert" class="content-image">
                <p class="image-caption">Friedrich Ebert, der erste Reichspräsident</p>
                <img src="images/hyperinflation_1923.jpg" alt="Hyperinflation 1923" class="content-image">
                <p class="image-caption">Kinder spielen mit Banknotenbündeln während der Hyperinflation</p>

                <h3>Die Goldenen Zwanziger</h3>
                <p>Zwischen 1924 und 1929 erlebte die Republik eine Phase relativer Stabilität und wirtschaftlicher Erholung, die sogenannten "Goldenen Zwanziger". Dies war maßgeblich durch den <strong>Dawes-Plan</strong> (1924) und später den Young-Plan (1929) unterstützt, die internationale Kredite und Regelungen für Reparationszahlungen brachten. Ein wichtiger Außenpolitiker dieser Zeit war **Gustav Stresemann**, der für eine Politik der Annäherung stand und 1925 den **Locarno-Pakt** aushandelte, der die Westgrenzen Deutschlands sicherte. Kulturell war diese Zeit sehr lebendig und innovativ.</p>
                <img src="images/gustav_stresemann.jpg" alt="Gustav Stresemann" class="content-image">
                <p class="image-caption">Gustav Stresemann, prägender Außenpolitiker der Weimarer Republik</p>

                <h3>Ende der Republik</h3>
                <p>Der <strong>Börsenkrach in New York</strong> 1929 löste die Weltwirtschaftskrise aus, die Deutschland besonders hart traf. Massenarbeitslosigkeit und soziale Not führten zu politischer Radikalisierung. Die demokratischen Parteien verloren an Einfluss, während die Kommunistische Partei (KPD) und die **Nationalsozialistische Deutsche Arbeiterpartei (NSDAP)** unter <strong>Adolf Hitler</strong> starken Zulauf erhielten. Durch sogenannte **Präsidialkabinette** (Regierungen, die sich nicht auf eine Parlamentsmehrheit stützten, sondern per Notverordnung regierten) regierten zunehmend autoritär, bis Hitler am <strong>30. Januar 1933</strong> zum Reichskanzler ernannt wurde, was das Ende der Weimarer Republik besiegelte.</p>
                <img src="images/weltwirtschaftskrise_arbeitslosigkeit.jpg" alt="Weltwirtschaftskrise Arbeitslosigkeit" class="content-image">
                <p class="image-caption">Schlange von Arbeitslosen während der Weltwirtschaftskrise</p>
            `,
            flashcards: [
                { front: "Erster Reichspräsident der Weimarer Republik?", back: "Friedrich Ebert" },
                { front: "Wirtschaftskrise 1923?", back: "Hyperinflation" },
                { front: "Tagungsort der Nationalversammlung 1919?", back: "Weimar" },
                { front: "Wirtschaftliche Stabilisierung nach 1923 durch US-Kredite?", back: "Dawes-Plan" },
                { front: "Ereignis, das die Weltwirtschaftskrise 1929 auslöste?", back: "Börsenkrach in New York" },
                { front: "Partei, die am Ende der Republik stark aufstieg?", back: "NSDAP" },
            ],
            quizQuestions: [ // Mindestens 10, bis zu 20
                {
                    question: "Wer war der erste Reichspräsident der Weimarer Republik?",
                    type: "short-answer",
                    correctAnswer: "Friedrich Ebert",
                    feedbackCorrect: "Sehr gut! Friedrich Ebert war der erste Reichspräsident.",
                    feedbackIncorrect: "Leider falsch. Der erste Reichspräsident war Friedrich Ebert."
                },
                {
                    question: "Was war ein wesentliches Merkmal der Wirtschaft in der Weimarer Republik, das 1923 zu großen Problemen führte?",
                    type: "multiple-choice",
                    options: ["Goldstandard", "Exportboom", "Hyperinflation", "Industriewachstum"],
                    correctAnswer: "Hyperinflation",
                    feedbackCorrect: "Exzellent! Die Hyperinflation entwertete das Geld massiv und führte zu Armut.",
                    feedbackIncorrect: "Leider falsch. Die Hyperinflation war das große Problem."
                },
                {
                    question: "Welche Stadt war 1919 der Tagungsort der Nationalversammlung, die die Verfassung der Weimarer Republik verabschiedete?",
                    type: "multiple-choice",
                    options: ["Berlin", "München", "Weimar", "Frankfurt"],
                    correctAnswer: "Weimar",
                    feedbackCorrect: "Korrekt! Daher der Name 'Weimarer Republik'.",
                    feedbackIncorrect: "Falsch. Die Verfassung wurde in Weimar verabschiedet."
                },
                {
                    question: "Wie nannte man die wirtschaftliche Stabilisierung nach der Hyperinflation, die durch amerikanische Kredite unterstützt wurde?",
                    type: "multiple-choice",
                    options: ["Ruhrbesetzung", "Dawes-Plan", "Young-Plan", "Locarno-Pakt"],
                    correctAnswer: "Dawes-Plan",
                    feedbackCorrect: "Richtig! Der Dawes-Plan brachte eine kurzfristige Stabilisierung.",
                    feedbackIncorrect: "Falsch. Es war der Dawes-Plan."
                },
                {
                    question: "Welches Ereignis am 'Schwarzen Donnerstag' im Jahr 1929 leitete die Weltwirtschaftskrise ein und hatte weitreichende Folgen für die Weimarer Republik?",
                    type: "short-answer",
                    correctAnswer: "Börsenkrach in New York",
                    acceptableAnswers: ["börsenkrach", "börsencrash", "schwarzer donnerstag", "weltwirtschaftskrise"], 
                    feedbackCorrect: "Stimmt genau! Der Börsenkrach in New York traf die Weimarer Republik hart.",
                    feedbackIncorrect: "Leider falsch. Es war der Börsenkrach in New York."
                },
                {
                    question: "Welche Partei erlebte am Ende der Weimarer Republik einen starken Aufstieg und nutzte die Krisen aus?",
                    type: "multiple-choice",
                    options: ["SPD", "Zentrumspartei", "KPD", "NSDAP"],
                    correctAnswer: "NSDAP",
                    feedbackCorrect: "Genau! Die NSDAP profitierte stark von den Krisen.",
                    feedbackIncorrect: "Falsch. Es war die NSDAP."
                },
                {
                    question: "Welches Abkommen regelte 1925 die Anerkennung der Westgrenzen Europas und brachte eine Phase der Entspannung?",
                    type: "short-answer",
                    correctAnswer: "Locarno-Pakt",
                    feedbackCorrect: "Exzellent! Der Locarno-Pakt verbesserte die Beziehungen zu den Westmächten.",
                    feedbackIncorrect: "Leider falsch. Es war der Locarno-Pakt."
                },
                {
                    question: "Wie wurde der Vertrag genannt, der Deutschland nach dem Ersten Weltkrieg auferlegt wurde und als große Belastung für die Weimarer Republik galt?",
                    type: "short-answer",
                    correctAnswer: "Versailler Vertrag",
                    feedbackCorrect: "Korrekte Antwort! Der Versailler Vertrag war eine schwere Bürde.",
                    feedbackIncorrect: "Nicht ganz. Es war der Versailler Vertrag."
                },
                {
                    question: "Wer war der spätere Friedensnobelpreisträger und Außenminister, der für die Außenpolitik der Stabilität in den 'Goldenen Zwanzigern' stand?",
                    type: "multiple-choice",
                    options: ["Gustav Stresemann", "Paul von Hindenburg", "Erich Ludendorff", "Philipp Scheidemann"],
                    correctAnswer: "Gustav Stresemann",
                    feedbackCorrect: "Richtig! Stresemann war eine Schlüsselfigur für die Stabilisierung.",
                    feedbackIncorrect: "Falsch. Es war Gustav Stresemann."
                },
                {
                    question: "Was war das Kennzeichen der sogenannten 'Präsidialkabinette' am Ende der Weimarer Republik?",
                    type: "short-answer",
                    correctAnswer: "Regierung ohne Parlamentsmehrheit",
                    acceptableAnswers: ["regierung ohne mehrheit", "präsidiale regierung", "notverordnungen"], 
                    feedbackCorrect: "Ja, diese Regierungen stützten sich auf Notverordnungen des Reichspräsidenten.",
                    feedbackIncorrect: "Leider falsch. Es war eine Regierung ohne Parlamentsmehrheit, die per Notverordnung regierte."
                }
            ]
        },
        {
            id: "nationalsozialismus",
            title: "Nationalsozialismus (1933-1945)",
            learnContent: `
                <h3>Etablierung der Diktatur</h3>
                <p>Nach der Ernennung **Adolf Hitlers** zum Reichskanzler am <strong>30. Januar 1933</strong> erfolgte die schnelle <strong>Gleichschaltung</strong> aller Lebensbereiche, d.h. die Anpassung an die nationalsozialistische Ideologie. Durch den **Reichstagsbrand** (Februar 1933), der als Vorwand diente, und das <strong>Ermächtigungsgesetz</strong> (März 1933) wurden demokratische Rechte außer Kraft gesetzt und die Macht der Regierung unbegrenzt. Politische Gegner wurden verfolgt und in Konzentrationslager gesperrt. Eine massive Propaganda und der Aufbau von Organisationen wie der <strong>Hitlerjugend</strong> und dem **Bund Deutscher Mädel** sicherten die Kontrolle über die Bevölkerung.</p>
                <img src="images/reichstagsbrand.jpg" alt="Reichstagsbrand" class="content-image">
                <p class="image-caption">Der brennende Reichstag in Berlin, Februar 1933</p>

                <h3>Terror und Ideologie</h3>
                <p>Der NS-Staat basierte auf einer rassistischen und antisemitischen Ideologie, die die Vorstellung einer überlegenen "arischen Rasse" verbreitete und alle Nicht-Arier ausschloss. Die <strong>Nürnberger Gesetze</strong> (1935) entzogen jüdischen Bürgern die Rechte und die Staatsbürgerschaft. Die **Gestapo** (Geheime Staatspolizei) war das zentrale Instrument des Terrors. Die Idee der "Volksgemeinschaft" schloss alle Nicht-Arier aus und führte zu Verfolgung und Ausgrenzung. Die erste offene, reichsweite Gewaltaktion gegen Juden war die **Reichspogromnacht** im November 1938. Die **Sturmabteilung (SA)** spielte in der Anfangszeit eine wichtige Rolle, verlor aber ab 1934 zunehmend an Macht gegenüber der SS. Der Nationalsozialismus kann als eine Form des **Faschismus** mit rassistischen Merkmalen gesehen werden.</p>
                <img src="images/nuernberger_gesetze.jpg" alt="Nürnberger Gesetze" class="content-image">
                <p class="image-caption">Plakat zu den Nürnberger Gesetzen</p>

                <h3>Weg in den Krieg</h3>
                <p>Hitlers Außenpolitik zielte auf die Expansion und die Eroberung von "Lebensraum im Osten" ab. Nach dem "Anschluss" Österreichs 1938 und dem Münchner Abkommen (Sudetenland) folgte am <strong>1. September 1939</strong> der <strong>Überfall auf Polen</strong>, der den Zweiten Weltkrieg auslöste.</p>
                <img src="images/ueberfall_polen.jpg" alt="Überfall auf Polen" class="content-image">
                <p class="image-caption">Deutsche Truppen beim Überfall auf Polen, September 1939</p>
            `,
            flashcards: [
                { front: "Gesetz 1933, das Hitler uneingeschränkte Macht gab?", back: "Ermächtigungsgesetz" },
                { front: "Jugendorganisation der Nazis?", back: "Hitlerjugend" },
                { front: "System der geheimen Polizei?", back: "Gestapo" },
                { front: "Gesetze von 1935, die Juden die Rechte entzogen?", back: "Nürnberger Gesetze" },
                { front: "Prozess der Vereinheitlichung aller Lebensbereiche?", back: "Gleichschaltung" },
                { front: "Erste offene Gewaltaktion gegen Juden 1938?", back: "Reichspogromnacht" },
            ],
            quizQuestions: [ // Mindestens 10, bis zu 20
                {
                    question: "Wie nannte man das Gesetz, das 1933 der Regierung Hitlers die Macht gab, Gesetze ohne Zustimmung des Parlaments zu erlassen?",
                    type: "short-answer",
                    correctAnswer: "Ermächtigungsgesetz",
                    feedbackCorrect: "Genau! Das Ermächtigungsgesetz war ein entscheidender Schritt zur Diktatur.",
                    feedbackIncorrect: "Falsch. Das Ermächtigungsgesetz war korrekt."
                },
                {
                    question: "Welche Organisation war für die Erziehung der Jugend im Nationalsozialismus zuständig?",
                    type: "multiple-choice",
                    options: ["Reichsarbeitsdienst", "Hitlerjugend", "Bund Deutscher Mädel", "Sturmabteilung"],
                    correctAnswer: "Hitlerjugend",
                    feedbackCorrect: "Korrekt! Die Hitlerjugend indoktrinierte die Jugend.",
                    feedbackIncorrect: "Leider falsch. Die Hitlerjugend war korrekt."
                },
                {
                    question: "Was war ein zentrales Element der NS-Propaganda zur Manipulation der Bevölkerung?",
                    type: "short-answer",
                    correctAnswer: "Volksgemeinschaft",
                    feedbackCorrect: "Richtig! Die Idee der Volksgemeinschaft war ein mächtiges Propagandamittel.",
                    feedbackIncorrect: "Falsch. Die 'Volksgemeinschaft' war ein Schlüsselbegriff."
                },
                {
                    question: "Welches war die erste offene, reichsweite Gewaltaktion gegen Juden im November 1938?",
                    type: "multiple-choice",
                    options: ["Reichstagsbrand", "Boykott jüdischer Geschäfte", "Reichspogromnacht", "Nürnberger Gesetze"],
                    correctAnswer: "Reichspogromnacht",
                    feedbackCorrect: "Absolut! Die Reichspogromnacht war ein Wendepunkt der Gewalt.",
                    feedbackIncorrect: "Leider falsch. Die Antwort ist Reichspogromnacht."
                },
                {
                    question: "Wie wurde das System der geheimen Polizei im NS-Staat genannt?",
                    type: "short-answer",
                    correctAnswer: "Gestapo",
                    feedbackCorrect: "Exzellent! Die Gestapo war das Terrorinstrument des NS-Staates.",
                    feedbackIncorrect: "Nicht ganz. Die Gestapo war die richtige Antwort."
                },
                {
                    question: "Welche Gesetze entzogen 1935 den jüdischen Bürgern die Staatsbürgerschaft und andere Rechte?",
                    type: "multiple-choice",
                    options: ["Lex Hitler", "Notstandsgesetze", "Nürnberger Gesetze", "Gleichschaltungsgesetze"],
                    correctAnswer: "Nürnberger Gesetze",
                    feedbackCorrect: "Richtig! Die Nürnberger Gesetze waren ein wichtiger Schritt zur Diskriminierung.",
                    feedbackIncorrect: "Falsch. Es waren die Nürnberger Gesetze."
                },
                {
                    question: "Wie nannte man den Prozess der Anpassung aller Lebensbereiche an die nationalsozialistische Ideologie?",
                    type: "short-answer",
                    correctAnswer: "Gleichschaltung",
                    feedbackCorrect: "Sehr gut! Die Gleichschaltung umfasste Politik, Gesellschaft und Kultur.",
                    feedbackIncorrect: "Falsch. Der Begriff war Gleichschaltung."
                },
                 {
                    question: "Welches Ereignis im Februar 1933 nutzte Hitler als Vorwand, um Grundrechte außer Kraft zu setzen?",
                    type: "short-answer",
                    correctAnswer: "Reichstagsbrand",
                    feedbackCorrect: "Korrekt! Der Reichstagsbrand diente als Begründung für Notverordnungen.",
                    feedbackIncorrect: "Falsch. Es war der Reichstagsbrand."
                },
                {
                    question: "Welche politische Ideologie bildete die Grundlage des Nationalsozialismus?",
                    type: "multiple-choice",
                    options: ["Liberalismus", "Kommunismus", "Faschismus", "Sozialismus"],
                    correctAnswer: "Faschismus",
                    feedbackCorrect: "Richtig! Der Nationalsozialismus war eine Form des Faschismus mit rassistischen Merkmalen.",
                    feedbackIncorrect: "Falsch. Die korrekte Antwort ist Faschismus."
                },
                {
                    question: "Wie nannte sich die Organisation der SA, die ab 1934 durch die SS zunehmend an Macht verlor?",
                    type: "short-answer",
                    correctAnswer: "Sturmabteilung",
                    acceptableAnswers: ["sturmabteilung", "sa"],
                    feedbackCorrect: "Genau! Die SA spielte eine wichtige Rolle in der Anfangszeit.",
                    feedbackIncorrect: "Leider falsch. Es war die Sturmabteilung (SA)."
                }
            ]
        },
        {
            id: "zweiter_weltkrieg",
            title: "Zweiter Weltkrieg (1939-1945)",
            learnContent: `
                <h3>Beginn und Ausbreitung</h3>
                <p>Der Zweite Weltkrieg begann am <strong>1. September 1939</strong> mit dem <strong>Überfall der Wehrmacht auf Polen</strong>, woraufhin Großbritannien und Frankreich Deutschland den Krieg erklärten. Der Krieg entwickelte sich schnell zu einem globalen Konflikt, der weite Teile Europas, Nordafrikas und Asiens umfasste. Nach dem Überfall auf Polen folgte im April 1940 die Invasion von **Norwegen und Dänemark**, um die Flanken zu sichern und Zugang zu den Rohstofflieferungen aus Schweden zu gewährleisten.</p>
                <img src="images/blitzkrieg_panzer.jpg" alt="Blitzkrieg Panzer" class="content-image">
                <p class="image-caption">Deutsche Panzer im "Blitzkrieg" während der Invasion Polens</p>

                <h3>Kriegsverlauf und Wendepunkte</h3>
                <p>Zunächst erzielten die <strong>Achsenmächte</strong> (Deutschland, Italien, Japan – die den **Dreimächtepakt** bildeten) große Erfolge, z.B. mit dem "Blitzkrieg" in Westeuropa. Ab 1941 weitete sich der Krieg mit dem Angriff auf die Sowjetunion ("**Unternehmen Barbarossa**") und dem Eintritt der USA (nach dem japanischen **Angriff auf Pearl Harbor**) aus. Wichtige Wendepunkte waren die <strong>Schlacht von Stalingrad</strong> (1942/43) an der Ostfront, die den deutschen Vormarsch stoppte, und die <strong>Landung der Alliierten in der Normandie (D-Day)</strong> im Juni 1944 in Westeuropa, die die Eröffnung einer zweiten Front bedeutete.</p>
                <img src="images/schlacht_stalingrad.jpg" alt="Schlacht von Stalingrad" class="content-image">
                <p class="image-caption">Sowjetische Soldaten in der Schlacht von Stalingrad</p>

                <h3>Der Holocaust und Kriegsende</h3>
                <p>Parallel zum Krieg verübten die Nationalsozialisten den systematischen Völkermord an sechs Millionen europäischen Juden, bekannt als der <strong>Holocaust</strong>. Mit dem Vormarsch der Alliierten im Westen und der Roten Armee im Osten geriet Deutschland in die Zange. Große Teile Deutschlands, darunter auch die sächsische Stadt <strong>Dresden</strong> im Februar 1945, wurden durch alliierte Luftangriffe zerstört. Der Krieg in Europa endete mit der bedingungslosen Kapitulation Deutschlands am <strong>8. Mai 1945</strong>.</p>
                <img src="images/dresden_zerstoerung.jpg" alt="Zerstörung Dresdens 1945" class="content-image">
                <p class="image-caption">Zerstörtes Dresden nach den Bombenangriffen im Februar 1945</p>
                `,
            flashcards: [
                { front: "Beginn des Zweiten Weltkriegs in Europa?", back: "Überfall auf Polen" },
                { front: "Völkermord an europäischen Juden?", back: "Holocaust" },
                { front: "Zerstörte sächsische Stadt Februar 1945?", back: "Dresden" },
                { front: "Jahr des Kriegsendes in Europa?", back: "1945" },
                { front: "Wichtige Schlacht im Osten (1942/43)?", back: "Stalingrad" },
                { front: "Landung der Alliierten in der Normandie 1944?", back: "D-Day" },
            ],
            quizQuestions: [ // Mindestens 10, bis zu 20
                {
                    question: "Welches Ereignis markierte den Beginn des Zweiten Weltkriegs in Europa?",
                    type: "multiple-choice",
                    options: ["Münchner Abkommen", "Anschluss Österreichs", "Überfall auf Polen", "Westfeldzug"],
                    correctAnswer: "Überfall auf Polen",
                    feedbackCorrect: "Genau! Der Überfall auf Polen am 1. September 1939 löste den Krieg aus.",
                    feedbackIncorrect: "Falsch. Es war der Überfall auf Polen."
                },
                {
                    question: "Wie heißt der Völkermord an den europäischen Juden durch das nationalsozialistische Deutschland?",
                    type: "short-answer",
                    correctAnswer: "Holocaust",
                    feedbackCorrect: "Richtig! Der Holocaust ist das dunkelste Kapitel dieser Zeit.",
                    feedbackIncorrect: "Leider falsch. Die Antwort ist Holocaust."
                },
                {
                    question: "Welche sächsische Stadt wurde im Februar 1945 durch alliierte Luftangriffe fast vollständig zerstört?",
                    type: "multiple-choice",
                    options: ["Leipzig", "Chemnitz", "Dresden", "Görlitz"],
                    correctAnswer: "Dresden",
                    feedbackCorrect: "Korrekt! Die Zerstörung Dresdens ist ein tragisches Ereignis des Krieges.",
                    feedbackIncorrect: "Falsch. Die Antwort ist Dresden."
                },
                {
                    question: "In welchem Jahr endete der Zweite Weltkrieg in Europa?",
                    type: "short-answer",
                    correctAnswer: "1945",
                    feedbackCorrect: "Sehr gut! 1945 war das Kriegsende in Europa.",
                    feedbackIncorrect: "Nicht ganz. Das Kriegsende in Europa war 1945."
                },
                {
                    question: "Welches war das wichtigste militärische Bündnis der Achsenmächte im Zweiten Weltkrieg?",
                    type: "multiple-choice",
                    options: ["NATO", "Warschauer Pakt", "Dreimächtepakt", "Antikominternpakt"],
                    correctAnswer: "Dreimächtepakt",
                    feedbackCorrect: "Stimmt! Deutschland, Italien und Japan bildeten den Dreimächtepakt.",
                    feedbackIncorrect: "Leider falsch. Es war der Dreimächtepakt."
                },
                {
                    question: "Welche wichtige Schlacht im Osten markierte 1942/43 eine Wende im Zweiten Weltkrieg?",
                    type: "short-answer",
                    correctAnswer: "Stalingrad",
                    feedbackCorrect: "Absolut! Die Schlacht von Stalingrad war ein entscheidender Wendepunkt.",
                    feedbackIncorrect: "Falsch. Es war Stalingrad."
                },
                {
                    question: "Wie nennt man die Landung der Alliierten in der Normandie im Juni 1944, die zur Befreiung Westeuropas führte?",
                    type: "short-answer",
                    correctAnswer: "D-Day",
                    acceptableAnswers: ["d-day", "operation overlord", "landung in der normandie"],
                    feedbackCorrect: "Sehr gut! Der D-Day war eine der größten Militäroperationen der Geschichte.",
                    feedbackIncorrect: "Falsch. Es war der D-Day oder die Landung in der Normandie."
                },
                {
                    question: "Welches Land war nach dem Überfall auf Polen das nächste Ziel des deutschen 'Blitzkriegs' im April 1940?",
                    type: "multiple-choice",
                    options: ["Sowjetunion", "Frankreich", "Großbritannien", "Norwegen und Dänemark"],
                    correctAnswer: "Norwegen und Dänemark",
                    feedbackCorrect: "Richtig! Die Invasion von Norwegen und Dänemark sicherte die Flanken.",
                    feedbackIncorrect: "Falsch. Es waren Norwegen und Dänemark."
                },
                {
                    question: "Was war das Ziel der alliierten 'Operation Barbarossa'?",
                    type: "short-answer",
                    correctAnswer: "Angriff auf die Sowjetunion",
                    acceptableAnswers: ["angriff auf sowjetunion", "invasion sowjetunion", "feldzug gegen sowjetunion"],
                    feedbackCorrect: "Genau! Der Angriff auf die Sowjetunion war ein entscheidender Fehler Hitlers.",
                    feedbackIncorrect: "Leider falsch. Es war der Angriff auf die Sowjetunion."
                },
                {
                    question: "Welches Ereignis führte zum Kriegseintritt der USA in den Zweiten Weltkrieg?",
                    type: "multiple-choice",
                    options: ["Angriff auf Pearl Harbor", "Schlacht um Midway", "Normandie-Landung", "Fall von Berlin"],
                    correctAnswer: "Angriff auf Pearl Harbor",
                    feedbackCorrect: "Absolut! Der Angriff auf Pearl Harbor zwang die USA in den Krieg.",
                    feedbackIncorrect: "Falsch. Der Angriff auf Pearl Harbor führte zum Kriegseintritt der USA."
                }
            ]
        },
        // NEUES KAPITEL: Nachkriegszeit in Deutschland
        {
            id: "nachkriegszeit_deutschland",
            title: "Nachkriegszeit in Deutschland (ab 1945)",
            learnContent: `
                <h3>Besatzungszonen und Kalter Krieg</h3>
                <p>Nach der bedingungslosen Kapitulation Deutschlands **am 8. Mai 1945** wurde das Land von den **vier Siegermächten** (USA, Großbritannien, Frankreich, Sowjetunion) in Besatzungszonen aufgeteilt. Berlin wurde ebenfalls geteilt. Die Spannungen zwischen den westlichen Alliierten und der Sowjetunion führten zum <strong>Kalten Krieg</strong>, einem Systemkonflikt ohne direkte militärische Auseinandersetzung zwischen den Großmächten, und schließlich zur deutschen Teilung.</p>
                <img src="images/besatzungszonen_deutschland.jpg" alt="Besatzungszonen Deutschlands" class="content-image">
                <p class="image-caption">Deutschland und Berlin in den vier Besatzungszonen</p>

                <h3>Gründung zweier deutscher Staaten</h3>
                <p>1949 wurden zwei deutsche Staaten gegründet: die <strong>Bundesrepublik Deutschland (BRD)</strong> im Westen (mit der Hauptstadt Bonn) und die <strong>Deutsche Demokratische Republik (DDR)</strong> im Osten (mit der Hauptstadt Ost-Berlin). Die BRD entwickelte sich zu einer parlamentarischen Demokratie mit sozialer Marktwirtschaft, geprägt durch das **Wirtschaftswunder** und unter der Führung von Kanzler **Konrad Adenauer**. Die DDR hingegen war ein sozialistischer Staat unter sowjetischem Einfluss, mit einer Planwirtschaft.</p>
                <img src="images/konrad_adenauer.jpg" alt="Konrad Adenauer" class="content-image">
                <p class="image-caption">Konrad Adenauer, erster Bundeskanzler der BRD</p>
                <img src="images/wirtschaftswunder_vw_kaefer.jpg" alt="Wirtschaftswunder VW Käfer" class="content-image">
                <p class="image-caption">Produktion des VW Käfers als Symbol des Wirtschaftswunders</p>

                <h3>Wiedervereinigung</h3>
                <p>Die <strong>Berliner Mauer</strong>, 1961 errichtet, symbolisierte die Teilung Deutschlands und verhinderte die Flucht von DDR-Bürgern in den Westen. Die Unzufriedenheit in der DDR wuchs, und 1989 kam es zu friedlichen Revolutionen, den sogenannten **Montagsdemonstrationen**. Der Fall der Berliner Mauer am <strong>9. November 1989</strong> war ein entscheidendes Ereignis, das den Weg zur deutschen Einheit ebnete. Am <strong>3. Oktober 1990</strong> erfolgte schließlich die <strong>Deutsche Wiedervereinigung</strong>, bei der die DDR der Bundesrepublik beitrat.</p>
                <img src="images/berliner_mauerfall.jpg" alt="Mauerfall Berlin" class="content-image">
                <p class="image-caption">Der Fall der Berliner Mauer am 9. November 1989</p>
                `,
            flashcards: [
                { front: "Anzahl der Besatzungszonen nach 1945?", back: "Vier" },
                { front: "Zwei deutsche Staaten ab 1949?", back: "BRD und DDR" },
                { front: "Westdeutscher Ministerpräsident des Wirtschaftswunders?", back: "Konrad Adenauer" },
                { front: "Symbol der deutschen Teilung (ab 1961)?", back: "Berliner Mauer" },
                { front: "Datum des Mauerfalls?", back: "9. November 1989" },
                { front: "Datum der Deutschen Wiedervereinigung?", back: "3. Oktober 1990" }
            ],
            quizQuestions: [
                {
                    question: "In wie viele Besatzungszonen wurde Deutschland nach dem Zweiten Weltkrieg aufgeteilt?",
                    type: "multiple-choice",
                    options: ["Zwei", "Drei", "Vier", "Fünf"],
                    correctAnswer: "Vier",
                    feedbackCorrect: "Richtig! Von den vier Siegermächten.",
                    feedbackIncorrect: "Falsch. Es waren vier Besatzungszonen."
                },
                {
                    question: "Welche zwei deutschen Staaten wurden 1949 gegründet?",
                    type: "short-answer",
                    correctAnswer: "BRD und DDR",
                    acceptableAnswers: ["bundesrepublik deutschland und ddr", "brd und ddr", "ddr und brd", "deutsche demokratische republik und bundesrepublik deutschland"],
                    feedbackCorrect: "Genau! Die Bundesrepublik im Westen und die DDR im Osten.",
                    feedbackIncorrect: "Leider falsch. Es waren die BRD und die DDR."
                },
                {
                    question: "Wie nannte man die Phase des wirtschaftlichen Aufschwungs in Westdeutschland nach dem Krieg?",
                    type: "multiple-choice",
                    options: ["Planwirtschaft", "Goldene Zwanziger", "Wirtschaftswunder", "Große Depression"],
                    correctAnswer: "Wirtschaftswunder",
                    feedbackCorrect: "Exzellent! Das Wirtschaftswunder prägte die frühe BRD.",
                    feedbackIncorrect: "Falsch. Es war das Wirtschaftswunder."
                },
                {
                    question: "Welches Bauwerk wurde 1961 errichtet und symbolisierte die deutsche Teilung?",
                    type: "short-answer",
                    correctAnswer: "Berliner Mauer",
                    feedbackCorrect: "Richtig! Die Berliner Mauer trennte Ost und West Berlin.",
                    feedbackIncorrect: "Nicht ganz. Es war die Berliner Mauer."
                },
                {
                    question: "An welchem Datum fiel die Berliner Mauer?",
                    type: "multiple-choice",
                    options: ["17. Juni 1953", "9. November 1989", "3. Oktober 1990", "1. Mai 1990"],
                    correctAnswer: "9. November 1989",
                    feedbackCorrect: "Absolut! Ein historisches Datum.",
                    feedbackIncorrect: "Leider falsch. Es war der 9. November 1989."
                },
                {
                    question: "Wann fand die Deutsche Wiedervereinigung statt?",
                    type: "short-answer",
                    correctAnswer: "3. Oktober 1990",
                    acceptableAnswers: ["dritter oktober neunzehnhundertneunzig", "3 oktober 1990"],
                    feedbackCorrect: "Sehr gut! Der Tag der Deutschen Einheit.",
                    feedbackIncorrect: "Falsch. Die Wiedervereinigung war am 3. Oktober 1990."
                },
                {
                    question: "Wie wurde der Konflikt zwischen den westlichen Alliierten und der Sowjetunion nach 1945 genannt?",
                    type: "multiple-choice",
                    options: ["Vietnamkrieg", "Kalter Krieg", "Korea-Krieg", "Nahostkonflikt"],
                    correctAnswer: "Kalter Krieg",
                    feedbackCorrect: "Korrekt! Eine Zeit der Blockkonfrontation.",
                    feedbackIncorrect: "Falsch. Es war der Kalte Krieg."
                }
            ]
        }
    ];

    // --- ZUFALLSFUNKTION: Fisher-Yates-Shuffle ---
    function shuffleArray(array) {
        console.log(`FUNCTION: shuffleArray called. Shuffling array of length ${array.length}.`);
        const shuffledArray = [...array]; 
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; 
        }
        console.log("DEBUG: Array shuffled.");
        return shuffledArray;
    }

    // --- QUIZ-FUNKTIONEN (Allgemein, für Kapitel-Quiz und umfassendes Quiz) ---
    let currentQuizQuestions = [];
    let currentQuizIndex = 0;
    let correctAnswersCount = 0;
    let totalQuestionsAsked = 0;
    let quizType = ''; // 'practice' oder 'comprehensive'
    let chapterForQuiz = null; // Speichert das Kapitel-Objekt für das Quiz

    // UI-Elemente für Quizze (global, da sie je nach Quiz-Typ zugewiesen werden)
    let quizProgressBarElement = null;
    let quizProgressTextElement = null;
    let quizQuestionTextElement = null;
    let quizAnswerOptionsDiv = null;
    let quizShortAnswerInput = null;
    let quizSubmitButton = null;
    let quizFeedbackTextElement = null;
    let quizNextButton = null;


    // Initialisiert ein Quiz
    function startQuiz(questions, type, chapter = null) {
        console.log(`FUNCTION: startQuiz initiated for type '${type}' with ${questions.length} questions.`);
        currentQuizQuestions = shuffleArray(questions);
        
        const maxQuestions = (type === 'comprehensive') ? 40 : 20;
        const minQuestions = (type === 'comprehensive') ? 25 : 10;
        
        currentQuizQuestions = currentQuizQuestions.slice(0, Math.min(currentQuizQuestions.length, maxQuestions));
        if (currentQuizQuestions.length < minQuestions) {
             console.warn(`WARN: Not enough questions for ${type} quiz. Only ${currentQuizQuestions.length} questions available. Minimum is ${minQuestions}.`);
        }

        currentQuizIndex = 0;
        correctAnswersCount = 0;
        totalQuestionsAsked = 0;
        quizType = type;
        chapterForQuiz = chapter;

        const currentUser = getCurrentUser();
        if (currentUser) {
            const progress = getQuizProgress(currentUser.username, chapter ? chapter.id : 'comprehensive', quizType);
            correctAnswersCount = progress.correct;
            totalQuestionsAsked = progress.totalAsked;
        }

        // UI-Elemente zuweisen je nach Quiz-Typ
        if (quizType === 'practice') {
            quizProgressBarElement = getElementById('quizProgressBar');
            quizProgressTextElement = getElementById('quizProgressText');
            quizQuestionTextElement = getElementById('quizQuestionText');
            quizAnswerOptionsDiv = getElementById('quizAnswerOptions');
            quizShortAnswerInput = getElementById('quizShortAnswerInput');
            quizSubmitButton = getElementById('submitQuizAnswerButton');
            quizFeedbackTextElement = getElementById('quizFeedbackText');
            quizNextButton = getElementById('quizNextButton');
            if (chapterForQuiz) {
                getElementById('quizChapterTitle').textContent = chapterForQuiz.title;
            }
        } else if (quizType === 'comprehensive') {
            quizProgressBarElement = getElementById('comprehensiveProgressBar');
            quizProgressTextElement = getElementById('comprehensiveProgressText');
            quizQuestionTextElement = getElementById('comprehensiveQuizQuestionText');
            quizAnswerOptionsDiv = getElementById('comprehensiveQuizAnswerOptions');
            quizShortAnswerInput = getElementById('comprehensiveQuizShortAnswerInput');
            quizSubmitButton = getElementById('submitComprehensiveQuizAnswerButton');
            quizFeedbackTextElement = getElementById('comprehensiveQuizFeedbackText');
            quizNextButton = getElementById('comprehensiveQuizNextButton');
        }

        if (!quizProgressBarElement || !quizProgressTextElement || !quizQuestionTextElement || !quizAnswerOptionsDiv || !quizShortAnswerInput || !quizSubmitButton || !quizFeedbackTextElement || !quizNextButton) {
            console.error("ERROR: One or more quiz UI elements not found for current quiz type. Cannot start quiz.");
            return;
        }
        
        // Event Listener nur einmalig anfügen
        // Überprüfen, ob der Event Listener bereits hinzugefügt wurde, um Mehrfachausführung zu vermeiden
        if (!quizSubmitButton._hasClickListener) { 
            quizSubmitButton.addEventListener('click', () => {
                console.log("EVENT: Quiz 'Antwort prüfen' button clicked.");
                const userAnswer = quizShortAnswerInput.value.trim(); 
                checkQuizAnswer(userAnswer); 
            });
            quizSubmitButton._hasClickListener = true;
        }
        if (!quizNextButton._hasClickListener) {
            quizNextButton.addEventListener('click', loadNextQuizQuestion);
            quizNextButton._hasClickListener = true;
        }

        updateQuizProgressBar();
        displayQuizQuestion();
    }

    // Zeigt die aktuelle Quizfrage an
    function displayQuizQuestion() {
        console.log(`FUNCTION: displayQuizQuestion initiated. Question Index: ${currentQuizIndex}/${currentQuizQuestions.length}`);

        quizAnswerOptionsDiv.innerHTML = ''; 
        quizShortAnswerInput.classList.add('hidden'); 
        quizSubmitButton.classList.add('hidden');
        quizNextButton.classList.add('hidden'); 
        quizShortAnswerInput.disabled = false;
        quizSubmitButton.disabled = false;
        quizFeedbackTextElement.classList.add('hidden'); 
        quizShortAnswerInput.value = ''; 
        
        if (currentQuizIndex >= currentQuizQuestions.length) {
            console.log("DEBUG: All quiz questions displayed. Quiz finished.");
            showQuizResults();
            return;
        }

        const questionData = currentQuizQuestions[currentQuizIndex];
        quizQuestionTextElement.textContent = questionData.question;
        
        if (questionData.type === 'multiple-choice' && questionData.options) {
            questionData.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.dataset.answer = option;
                button.addEventListener('click', (event) => checkQuizAnswer(event.target.dataset.answer, event.target));
                quizAnswerOptionsDiv.appendChild(button);
            });
        } else if (questionData.type === 'short-answer') {
            quizShortAnswerInput.classList.remove('hidden'); 
            quizSubmitButton.classList.remove('hidden');
            quizShortAnswerInput.focus();
        }
        updateQuizProgressBar();
    }

    // Prüft die Antwort auf eine Quizfrage
    function checkQuizAnswer(selectedAnswerOrUserInput, clickedButton = null) {
        console.log(`FUNCTION: checkQuizAnswer("${selectedAnswerOrUserInput}") initiated.`);
        const questionData = currentQuizQuestions[currentQuizIndex];
        if (!questionData) {
            console.error("ERROR: checkQuizAnswer called but no current question data is set.");
            showFeedback(quizFeedbackTextElement, "Ein interner Fehler ist aufgetreten.", true);
            quizNextButton.classList.remove('hidden');
            return;
        }

        let isCorrect = false;
        const cleanedUserAnswer = selectedAnswerOrUserInput.toLowerCase().trim();
        const cleanedCorrectAnswer = questionData.correctAnswer.toLowerCase().trim();
        
        const feedbackCorrect = questionData.feedbackCorrect || "Genau! Das ist richtig.";
        const feedbackIncorrect = questionData.feedbackIncorrect || `Leider falsch. Die richtige Antwort war: "${questionData.correctAnswer}".`; 

        if (questionData.type === 'multiple-choice') {
            isCorrect = (cleanedUserAnswer === cleanedCorrectAnswer);
            quizAnswerOptionsDiv.querySelectorAll('button').forEach(btn => {
                btn.disabled = true; // Alle Optionen deaktivieren
                if (btn.dataset.answer.toLowerCase().trim() === cleanedCorrectAnswer) {
                    btn.classList.add('correct'); // Richtige Antwort grün markieren
                } else if (btn === clickedButton) {
                    btn.classList.add('incorrect'); // Falsche gewählte Antwort rot markieren
                }
            });
        } else if (questionData.type === 'short-answer') {
            if (questionData.acceptableAnswers && questionData.acceptableAnswers.length > 0) {
                isCorrect = questionData.acceptableAnswers.includes(cleanedUserAnswer);
            } else {
                isCorrect = cleanedUserAnswer === cleanedCorrectAnswer;
            }
            quizShortAnswerInput.disabled = true; 
            quizSubmitButton.disabled = true; 
        }

        if (isCorrect) {
            showFeedback(quizFeedbackTextElement, feedbackCorrect, false);
            correctAnswersCount++;
        } else {
            showFeedback(quizFeedbackTextElement, feedbackIncorrect, true);
        }
        totalQuestionsAsked++;
        // Update quiz progress in localStorage
        const currentUser = getCurrentUser();
        if (currentUser) {
            updateQuizProgress(currentUser.username, chapterForQuiz ? chapterForQuiz.id : 'comprehensive', quizType, correctAnswersCount, totalQuestionsAsked);
        } else {
            console.warn("WARN: No current user found for updating quiz progress.");
        }
        
        quizNextButton.classList.remove('hidden'); 
    }

    // Lädt die nächste Quizfrage
    function loadNextQuizQuestion() {
        console.log("FUNCTION: loadNextQuizQuestion initiated.");
        currentQuizIndex++;
        displayQuizQuestion();
    }

    // Zeigt die Ergebnisse des Quiz an
    function showQuizResults() {
        console.log("FUNCTION: showQuizResults initiated.");
        alert(`Quiz beendet! Du hast ${correctAnswersCount} von ${totalQuestionsAsked} Fragen richtig beantwortet.`);
        if (quizType === 'practice') {
            window.location.href = 'learning_mode_selection.html';
        } else if (quizType === 'comprehensive') {
            window.location.href = 'chapter_selection.html'; // Oder zur Profilseite
        }
    }

    // Aktualisiert den Fortschrittsbalken
    function updateQuizProgressBar() {
        if (!quizProgressBarElement || !quizProgressTextElement) {
            console.warn("WARN: Quiz progress bar elements not found.");
            return;
        }
        const percentage = (totalQuestionsAsked > 0) ? (correctAnswersCount / totalQuestionsAsked) * 100 : 0;
        quizProgressBarElement.style.width = `${percentage}%`;
        quizProgressTextElement.textContent = `${correctAnswersCount} / ${totalQuestionsAsked} Fragen richtig (${currentQuizIndex}/${currentQuizQuestions.length} gezeigt)`;
    }

    // --- BREADCRUMB NAVIGATION / KOMPASS FUNKTION ---
    const setupBreadcrumbNav = (pathSegments) => {
        const breadcrumbContainer = document.createElement('nav');
        breadcrumbContainer.classList.add('breadcrumb-nav');
        const olElement = document.createElement('ol');

        pathSegments.forEach((segment, index) => {
            const liElement = document.createElement('li');
            if (index === pathSegments.length - 1) {
                liElement.classList.add('active');
                const span = document.createElement('span');
                span.textContent = segment.name;
                liElement.appendChild(span);
            } else {
                const a = document.createElement('a');
                a.href = segment.url;
                a.textContent = segment.name;
                liElement.appendChild(a);
            }
            olElement.appendChild(liElement);
        });

        breadcrumbContainer.appendChild(olElement);
        const containerDiv = getElementById('authScreen') || document.querySelector('.container');
        if (containerDiv) {
            // Sicherstellen, dass das Breadcrumb nur einmal hinzugefügt wird
            if (!containerDiv.querySelector('.breadcrumb-nav')) {
                containerDiv.insertBefore(breadcrumbContainer, containerDiv.firstChild);
            }
        }
    };

    // --- PROFILSEITE LOGIK ---
    const loadProfileStats = () => {
        console.log("FUNCTION: loadProfileStats initiated.");
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn("WARN: No user logged in. Cannot load profile stats.");
            window.location.href = 'index.html'; // Redirect to login
            return;
        }

        const profileUsernameElement = getElementById('profileUsername');
        if (profileUsernameElement) {
            profileUsernameElement.textContent = `Dein Profil, ${currentUser.username}`;
        }

        const allUserProgress = JSON.parse(localStorage.getItem(quizProgressKey) || '{}')[currentUser.username] || {};
        
        let overallCorrect = 0;
        let overallTotal = 0;
        let chaptersWithProgress = 0;
        const totalChapters = historyContent.length;

        // Comprehensive Quiz Stats
        const comprehensiveProgress = allUserProgress['comprehensive'] && allUserProgress['comprehensive']['comprehensive'] ? 
                                      allUserProgress['comprehensive']['comprehensive'] : { correct: 0, totalAsked: 0 };
        
        getElementById('comprehensiveCorrect').textContent = comprehensiveProgress.correct;
        getElementById('comprehensiveTotal').textContent = comprehensiveProgress.totalAsked;
        const comprehensivePercentage = comprehensiveProgress.totalAsked > 0 ? (comprehensiveProgress.correct / comprehensiveProgress.totalAsked) * 100 : 0;
        getElementById('comprehensiveQuizProgressBar').style.width = `${comprehensivePercentage}%`;
        getElementById('comprehensiveQuizProgressText').textContent = `${Math.round(comprehensivePercentage)}% richtig`;

        overallCorrect += comprehensiveProgress.correct;
        overallTotal += comprehensiveProgress.totalAsked;

        // Chapter specific stats
        const chapterStatsList = getElementById('chapterStatsList');
        chapterStatsList.innerHTML = ''; // Clear loading message

        historyContent.forEach(chapter => {
            const chapterProgress = allUserProgress[chapter.id] && allUserProgress[chapter.id]['practice'] ?
                                    allUserProgress[chapter.id]['practice'] : { correct: 0, totalAsked: 0 };
            
            overallCorrect += chapterProgress.correct;
            overallTotal += chapterProgress.totalAsked;

            const chapterPercentage = chapterProgress.totalAsked > 0 ? (chapterProgress.correct / chapterProgress.totalAsked) * 100 : 0;

            if (chapterProgress.totalAsked > 0) {
                chaptersWithProgress++;
            }

            const chapterStatItem = document.createElement('div');
            chapterStatItem.classList.add('chapter-stat-item');
            chapterStatItem.innerHTML = `
                <h4>${chapter.title}</h4>
                <p>Richtige Antworten (Kapitel-Quiz): ${chapterProgress.correct} / ${chapterProgress.totalAsked}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${chapterPercentage}%;"></div>
                </div>
                <p class="progress-text">${Math.round(chapterPercentage)}% richtig im Kapitel-Quiz</p>
                <button class="small-button" onclick="goToChapterLearning('${chapter.id}')">Zum Kapitel</button>
            `;
            chapterStatsList.appendChild(chapterStatItem);
        });

        // Overall progress
        const overallCompletionPercentage = totalChapters > 0 ? (chaptersWithProgress / totalChapters) * 100 : 0;
        getElementById('overallProgressBar').style.width = `${overallCompletionPercentage}%`;
        getElementById('overallProgressText').textContent = `${Math.round(overallCompletionPercentage)}% der Kapitel bearbeitet (${chaptersWithProgress}/${totalChapters})`;
        getElementById('overallCorrectAnswers').textContent = overallCorrect;
        getElementById('overallTotalQuestions').textContent = overallTotal;

        console.log("DEBUG: Profile stats loaded.");
    };

    window.goToChapterLearning = (chapterId) => {
        setSelectedChapter(chapterId);
        window.location.href = 'learning_mode_selection.html';
    };


    // --- SEITENSPEZIFISCHE LOGIK ---

    // `index.html` (Auth Screen)
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        console.log("DEBUG: On index.html (Auth Screen).");

        const showLoginBtn = getElementById('showLoginBtn');
        const showRegisterBtn = getElementById('showRegisterBtn');
        const loginForm = getElementById('loginForm');
        const registerForm = getElementById('registerForm');
        const loginUsernameInput = getElementById('loginUsername');
        const loginPasswordInput = getElementById('loginPassword');
        const loginBtn = getElementById('loginBtn');
        const registerUsernameInput = getElementById('registerUsername');
        const registerPasswordInput = getElementById('registerPassword');
        const registerClassSelect = getElementById('registerClass');
        const registerBtn = getElementById('registerBtn');
        const authFeedback = getElementById('authFeedback');
        const welcomeMessage = getElementById('welcomeMessage');

        const initAuthScreen = () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                welcomeMessage.textContent = `Willkommen zurück, ${currentUser.username}! Du bist bereits angemeldet.`;
                setTimeout(() => {
                    window.location.href = 'subject_selection.html';
                }, 1500); 
            } else {
                welcomeMessage.textContent = 'Bitte melde dich an oder registriere dich.';
            }
        };
        
        if (showLoginBtn && showRegisterBtn && loginForm && registerForm) {
            showLoginBtn.addEventListener('click', () => {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                showLoginBtn.classList.add('active');
                showRegisterBtn.classList.remove('active');
                authFeedback.classList.add('hidden');
            });

            showRegisterBtn.addEventListener('click', () => {
                registerForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
                showRegisterBtn.classList.add('active');
                showLoginBtn.classList.remove('active');
                authFeedback.classList.add('hidden');
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                const username = registerUsernameInput.value.trim();
                const password = registerPasswordInput.value.trim();
                const studentClass = registerClassSelect.value;

                if (!username || !password || !studentClass) {
                    showFeedback(authFeedback, 'Bitte fülle alle Felder aus.', true);
                    return;
                }

                let users = getUsers();
                if (users[username]) {
                    showFeedback(authFeedback, 'Benutzername existiert bereits!', true);
                    return;
                }

                users[username] = { password: password, class: studentClass };
                saveUsers(users);
                showFeedback(authFeedback, 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.', false);
                console.log(`DEBUG: User registered: ${username}, Class: ${studentClass}`);
                
                // Initialize user settings for new user
                getUserSettings(username); // This will create initial settings if not exist

                if (showLoginBtn && showRegisterBtn && loginForm && registerForm) {
                    showLoginBtn.click();
                }
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const username = loginUsernameInput.value.trim();
                const password = loginPasswordInput.value.trim();

                if (!username || !password) {
                    showFeedback(authFeedback, 'Bitte gib Benutzername und Passwort ein.', true);
                    return;
                }

                const users = getUsers();
                const user = users[username];

                if (user && user.password === password) {
                    setCurrentUser({ username: username, class: user.class });
                    showFeedback(authFeedback, `Willkommen, ${username}!`, false);
                    console.log(`DEBUG: User logged in: ${username}, Class: ${user.class}`);
                    
                    // Ensure user settings are loaded/initialized on login
                    getUserSettings(username);

                    setTimeout(() => {
                        window.location.href = 'subject_selection.html'; 
                    }, 1000);
                } else {
                    showFeedback(authFeedback, 'Ungültiger Benutzername oder Passwort.', true);
                }
            });
        }

        initAuthScreen(); 
        // Kein Breadcrumb auf der Anmeldeseite
    }

    // `subject_selection.html`
    else if (window.location.pathname.endsWith('subject_selection.html')) {
        console.log("DEBUG: On subject_selection.html.");

        const loggedInUsernameSpan = getElementById('loggedInUsername');
        const selectHistoryBtn = getElementById('selectHistoryBtn');
        const profileBtn = getElementById('profileBtn'); // New button
        const logoutBtn = getElementById('logoutBtn');

        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn("WARN: No user logged in. Redirecting to index.html.");
            window.location.href = 'index.html'; 
            return;
        }

        if (loggedInUsernameSpan) {
            loggedInUsernameSpan.textContent = currentUser.username;
        }

        if (selectHistoryBtn) {
            selectHistoryBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Geschichte' selected. Redirecting to chapter_selection.html.");
                window.location.href = 'chapter_selection.html'; 
            });
        }

        if (profileBtn) { // New button event listener
            profileBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Profil' button clicked. Redirecting to profile.html.");
                window.location.href = 'profile.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log("DEBUG: Logout button clicked.");
                setCurrentUser(null); 
                window.location.href = 'index.html'; 
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' }
        ]);
    }

    // `chapter_selection.html`
    else if (window.location.pathname.endsWith('chapter_selection.html')) {
        console.log("DEBUG: On chapter_selection.html.");

        const loggedInUsernameSpan = getElementById('loggedInUsername');
        const chapterListDiv = getElementById('chapterList');
        const comprehensiveQuizBtn = getElementById('comprehensiveQuizBtn');
        const backToSubjectsBtn = getElementById('backToSubjectsBtn');

        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn("WARN: No user logged in. Redirecting to index.html.");
            window.location.href = 'index.html';
            return;
        }

        if (loggedInUsernameSpan) {
            loggedInUsernameSpan.textContent = currentUser.username;
        }

        if (chapterListDiv) {
            historyContent.forEach(chapter => {
                const button = document.createElement('button');
                button.classList.add('chapter-button');
                button.textContent = chapter.title;
                button.dataset.chapterId = chapter.id;
                button.addEventListener('click', () => {
                    console.log(`EVENT: Chapter '${chapter.title}' selected. Redirecting to learning_mode_selection.html.`);
                    setSelectedChapter(chapter.id);
                    window.location.href = 'learning_mode_selection.html';
                });
                chapterListDiv.appendChild(button);
            });
            console.log("DEBUG: Chapter buttons rendered.");
        }

        if (comprehensiveQuizBtn) {
            comprehensiveQuizBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Umfassendes Quiz' button clicked. Redirecting to comprehensive_quiz.html.");
                let allQuestions = [];
                historyContent.forEach(chapter => {
                    allQuestions = allQuestions.concat(chapter.quizQuestions);
                });
                localStorage.setItem('comprehensiveQuizQuestions', JSON.stringify(allQuestions));
                setSelectedChapter('comprehensive'); // Set selected chapter to 'comprehensive' for quiz
                window.location.href = 'comprehensive_quiz.html';
            });
        }

        if (backToSubjectsBtn) {
            backToSubjectsBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Fächerwahl' button clicked.");
                window.location.href = 'subject_selection.html';
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' }
        ]);
    }

    // `learning_mode_selection.html`
    else if (window.location.pathname.endsWith('learning_mode_selection.html')) {
        console.log("DEBUG: On learning_mode_selection.html.");

        const selectedChapterTitleElement = getElementById('selectedChapterTitle');
        const learnContentBtn = getElementById('learnContentBtn');
        const practiceCardsBtn = getElementById('practiceCardsBtn');
        const practiceQuizBtn = getElementById('practiceQuizBtn');
        const backToChaptersBtn = getElementById('backToChaptersBtn');

        const currentUser = getCurrentUser();
        const selectedChapterId = getSelectedChapter();
        const currentChapter = historyContent.find(c => c.id === selectedChapterId);

        if (!currentUser || !currentChapter) {
            console.warn("WARN: No user or chapter selected. Redirecting to chapter_selection.html.");
            window.location.href = 'chapter_selection.html'; 
            return;
        }

        if (selectedChapterTitleElement) {
            selectedChapterTitleElement.textContent = currentChapter.title;
        }

        if (learnContentBtn) {
            learnContentBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Lernen' button clicked. Redirecting to learn_content.html.");
                window.location.href = 'learn_content.html';
            });
        }

        if (practiceCardsBtn) {
            practiceCardsBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Karteikarten' button clicked. Redirecting to practice_cards.html.");
                window.location.href = 'practice_cards.html';
            });
        }

        if (practiceQuizBtn) {
            practiceQuizBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Quiz' button clicked. Redirecting to practice_quiz.html.");
                window.location.href = 'practice_quiz.html';
            });
        }

        if (backToChaptersBtn) {
            backToChaptersBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Kapitelauswahl' button clicked.");
                window.location.href = 'chapter_selection.html';
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' },
            { name: currentChapter.title, url: 'learning_mode_selection.html' }
        ]);
    }

    // `learn_content.html`
    else if (window.location.pathname.endsWith('learn_content.html')) {
        console.log("DEBUG: On learn_content.html.");

        const learnContentChapterTitle = getElementById('learnContentChapterTitle');
        const learningContentDiv = getElementById('learningContent');
        const backToModeSelectionBtn = getElementById('backToModeSelectionBtn');

        const currentUser = getCurrentUser();
        const selectedChapterId = getSelectedChapter();
        const currentChapter = historyContent.find(c => c.id === selectedChapterId);

        if (!currentUser || !currentChapter) {
            console.warn("WARN: No user or chapter selected. Redirecting to chapter_selection.html.");
            window.location.href = 'chapter_selection.html'; 
            return;
        }

        if (learnContentChapterTitle) {
            learnContentChapterTitle.textContent = currentChapter.title;
        }
        if (learningContentDiv) {
            learningContentDiv.innerHTML = currentChapter.learnContent;
        }

        if (backToModeSelectionBtn) {
            backToModeSelectionBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Moduswahl' button clicked.");
                window.location.href = 'learning_mode_selection.html';
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' },
            { name: currentChapter.title, url: 'learning_mode_selection.html' },
            { name: 'Lernen', url: 'learn_content.html' }
        ]);
    }

    // `practice_cards.html`
    else if (window.location.pathname.endsWith('practice_cards.html')) {
        console.log("DEBUG: On practice_cards.html.");

        const flashcardsChapterTitle = getElementById('flashcardsChapterTitle');
        const flashcardContainer = getElementById('flashcardContainer');
        const flashcard = getElementById('flashcard');
        const flashcardFront = getElementById('flashcardFront');
        const flashcardBack = getElementById('flashcardBack');
        const flipCardBtn = getElementById('flipCardBtn');
        const nextCardBtn = getElementById('nextCardBtn');
        const backToModeSelectionBtn = getElementById('backToModeSelectionBtn');
        const flashcardsProgressBar = getElementById('flashcardsProgressBar');
        const flashcardsProgressText = getElementById('flashcardsProgressText');

        let currentFlashcards = [];
        let currentFlashcardIndex = 0;

        const currentUser = getCurrentUser();
        const selectedChapterId = getSelectedChapter();
        const currentChapter = historyContent.find(c => c.id === selectedChapterId);

        if (!currentUser || !currentChapter || !currentChapter.flashcards || currentChapter.flashcards.length === 0) {
            console.warn("WARN: No user, chapter, or flashcards found. Redirecting to learning_mode_selection.html.");
            showFeedback(flashcardsProgressText, "Keine Karteikarten für dieses Kapitel gefunden.", true);
            setTimeout(() => { window.location.href = 'learning_mode_selection.html'; }, 2000);
            return;
        }

        currentFlashcards = shuffleArray(currentChapter.flashcards);

        if (flashcardsChapterTitle) {
            flashcardsChapterTitle.textContent = currentChapter.title;
        }

        const displayFlashcard = () => {
            if (currentFlashcardIndex >= currentFlashcards.length) {
                console.log("DEBUG: All flashcards viewed. Restarting from beginning.");
                currentFlashcardIndex = 0;
                currentFlashcards = shuffleArray(currentChapter.flashcards);
                alert("Alle Karteikarten durchgearbeitet! Beginnt von Neuem.");
            }
            const card = currentFlashcards[currentFlashcardIndex];
            flashcardFront.textContent = card.front;
            flashcardBack.textContent = card.back;
            flashcard.classList.remove('flipped');
            updateFlashcardsProgressBar();
        };

        const updateFlashcardsProgressBar = () => {
            if (!flashcardsProgressBar || !flashcardsProgressText) return;
            const progress = (currentFlashcardIndex / currentFlashcards.length) * 100;
            flashcardsProgressBar.style.width = `${progress}%`;
            flashcardsProgressText.textContent = `${currentFlashcardIndex + 1}/${currentFlashcards.length} Karten angezeigt`; // +1 for user-friendly count
        };

        if (flipCardBtn) {
            flipCardBtn.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
            });
        }

        if (nextCardBtn) {
            nextCardBtn.addEventListener('click', () => {
                currentFlashcardIndex++;
                displayFlashcard();
            });
        }

        if (backToModeSelectionBtn) {
            backToModeSelectionBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Moduswahl' button clicked.");
                window.location.href = 'learning_mode_selection.html';
            });
        }

        displayFlashcard();
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' },
            { name: currentChapter.title, url: 'learning_mode_selection.html' },
            { name: 'Karteikarten', url: 'practice_cards.html' }
        ]);
    }

    // `practice_quiz.html`
    else if (window.location.pathname.endsWith('practice_quiz.html')) {
        console.log("DEBUG: On practice_quiz.html.");

        const backToModeSelectionBtn = getElementById('backToModeSelectionBtn');

        const currentUser = getCurrentUser();
        const selectedChapterId = getSelectedChapter();
        const currentChapter = historyContent.find(c => c.id === selectedChapterId);

        if (!currentUser || !currentChapter || !currentChapter.quizQuestions || currentChapter.quizQuestions.length === 0) {
            console.warn("WARN: No user, chapter, or quiz questions found. Redirecting to learning_mode_selection.html.");
            alert("Keine Quizfragen für dieses Kapitel gefunden!");
            setTimeout(() => { window.location.href = 'learning_mode_selection.html'; }, 1000);
            return;
        }
        
        startQuiz(currentChapter.quizQuestions, 'practice', currentChapter);

        if (backToModeSelectionBtn) {
            backToModeSelectionBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Moduswahl' button clicked from practice quiz.");
                window.location.href = 'learning_mode_selection.html';
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' },
            { name: currentChapter.title, url: 'learning_mode_selection.html' },
            { name: 'Kapitel-Quiz', url: 'practice_quiz.html' }
        ]);
    }

    // `comprehensive_quiz.html`
    else if (window.location.pathname.endsWith('comprehensive_quiz.html')) {
        console.log("DEBUG: On comprehensive_quiz.html.");

        const backToChaptersBtn = getElementById('backToChaptersBtn');

        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn("WARN: No user logged in. Redirecting to index.html.");
            window.location.href = 'index.html';
            return;
        }

        // Retrieve previously stored questions or build from content
        const allQuestionsString = localStorage.getItem('comprehensiveQuizQuestions');
        let allQuestions = [];
        if (allQuestionsString) {
            allQuestions = JSON.parse(allQuestionsString);
            localStorage.removeItem('comprehensiveQuizQuestions'); // Clean up after use
        } else {
            console.warn("WARN: No comprehensive quiz questions found in localStorage. Building from historyContent.");
            historyContent.forEach(chapter => {
                allQuestions = allQuestions.concat(chapter.quizQuestions);
            });
        }

        if (allQuestions.length === 0) {
            console.error("ERROR: No questions available for comprehensive quiz.");
            alert("Es konnten keine Fragen für das umfassende Quiz geladen werden.");
            setTimeout(() => { window.location.href = 'chapter_selection.html'; }, 1000);
            return;
        }

        startQuiz(allQuestions, 'comprehensive');

        if (backToChaptersBtn) {
            backToChaptersBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Kapitelauswahl' button clicked from comprehensive quiz.");
                window.location.href = 'chapter_selection.html';
            });
        }
        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Geschichte', url: 'chapter_selection.html' },
            { name: 'Umfassendes Quiz', url: 'comprehensive_quiz.html' }
        ]);
    }
    // `profile.html`
    else if (window.location.pathname.endsWith('profile.html')) {
        console.log("DEBUG: On profile.html.");

        const backToSubjectsBtn = getElementById('backToSubjectsBtn');
        const profileNameInput = getElementById('profileName');
        const editNameBtn = getElementById('editNameBtn');
        const saveNameBtn = getElementById('saveNameBtn');
        const cancelNameBtn = getElementById('cancelNameBtn');
        const nameChangeInfo = getElementById('nameChangeInfo');

        const profilePasswordInput = getElementById('profilePassword');
        const editPasswordBtn = getElementById('editPasswordBtn');
        const savePasswordBtn = getElementById('savePasswordBtn');
        const cancelPasswordBtn = getElementById('cancelPasswordBtn');
        const passwordConfirmationFields = getElementById('passwordConfirmationFields');
        const oldPasswordInput = getElementById('oldPassword');
        const newPasswordInput = getElementById('newPassword');
        const confirmNewPasswordInput = getElementById('confirmNewPassword');
        const passwordChangeInfo = getElementById('passwordChangeInfo');

        const profileClassSelect = getElementById('profileClass');
        const editClassBtn = getElementById('editClassBtn');
        const saveClassBtn = getElementById('saveClassBtn');
        const cancelClassBtn = getElementById('cancelClassBtn');
        const settingsFeedback = getElementById('settingsFeedback');

        let originalUserName = '';
        let originalUserClass = '';
        let currentUserSettings = null; // To store user-specific settings

        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.warn("WARN: No user logged in. Redirecting to index.html.");
            window.location.href = 'index.html';
            return;
        }

        // --- Load User Settings for Profile Page ---
        const loadUserSettingsForProfile = () => {
            profileNameInput.value = currentUser.username;
            originalUserName = currentUser.username;
            profileClassSelect.value = currentUser.class;
            originalUserClass = currentUser.class;
            profilePasswordInput.value = '********'; // Mask password

            currentUserSettings = getUserSettings(currentUser.username);
            updateNameChangeInfo();
            updatePasswordChangeInfo();
        };

        const updateNameChangeInfo = () => {
            if (currentUserSettings) {
                const remainingChanges = 5 - currentUserSettings.nameChanges.count;
                nameChangeInfo.textContent = `Verbleibende Namensänderungen diesen Monat: ${remainingChanges}/5`;
                if (remainingChanges <= 0) {
                    editNameBtn.disabled = true;
                    nameChangeInfo.textContent += " (Limit erreicht)";
                } else {
                    editNameBtn.disabled = false;
                }
            }
        };

        const updatePasswordChangeInfo = () => {
            if (currentUserSettings) {
                if (currentUserSettings.passwordChangedThisMonth) {
                    passwordChangeInfo.textContent = "Passwort wurde diesen Monat bereits geändert (Limit 1x pro Monat).";
                    editPasswordBtn.disabled = true;
                } else {
                    passwordChangeInfo.textContent = "Du kannst dein Passwort 1x pro Monat ändern.";
                    editPasswordBtn.disabled = false;
                }
            }
        };


        // --- Name Edit Logic ---
        if (editNameBtn) {
            editNameBtn.addEventListener('click', () => {
                profileNameInput.disabled = false;
                editNameBtn.classList.add('hidden');
                saveNameBtn.classList.remove('hidden');
                cancelNameBtn.classList.remove('hidden');
                profileNameInput.focus();
            });
        }

        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => {
                const newUsername = profileNameInput.value.trim();
                if (newUsername === originalUserName) {
                    showFeedback(settingsFeedback, "Benutzername wurde nicht geändert.", false);
                    cancelNameBtn.click(); // Go back to disabled state
                    return;
                }
                if (!newUsername) {
                    showFeedback(settingsFeedback, "Benutzername darf nicht leer sein.", true);
                    return;
                }

                let users = getUsers();
                if (users[newUsername] && newUsername !== originalUserName) {
                    showFeedback(settingsFeedback, "Dieser Benutzername ist bereits vergeben.", true);
                    return;
                }

                // Check name change limit
                if (currentUserSettings.nameChanges.count >= 5) {
                    showFeedback(settingsFeedback, "Limit für Namensänderungen diesen Monat erreicht (Max. 5).", true);
                    return;
                }

                // Update users object: delete old username, add new one
                const oldUser = users[originalUserName];
                delete users[originalUserName];
                users[newUsername] = oldUser;
                saveUsers(users);

                // Update current user in localStorage
                setCurrentUser({ username: newUsername, class: currentUser.class });

                // Update user settings entry (move/update if necessary)
                const allSettings = JSON.parse(localStorage.getItem(userSettingsKey) || '{}');
                if (allSettings[originalUserName]) {
                    allSettings[newUsername] = allSettings[originalUserName];
                    delete allSettings[originalUserName];
                    localStorage.setItem(userSettingsKey, JSON.stringify(allSettings));
                }
                
                currentUserSettings.nameChanges.count++;
                saveUserSettings(newUsername, currentUserSettings); // Save under new username

                showFeedback(settingsFeedback, "Benutzername erfolgreich geändert!", false);
                profileNameInput.disabled = true;
                editNameBtn.classList.remove('hidden');
                saveNameBtn.classList.add('hidden');
                cancelNameBtn.classList.add('hidden');
                originalUserName = newUsername; // Update original name
                profileUsername.textContent = `Dein Profil, ${newUsername}`; // Update profile header
                updateNameChangeInfo(); // Update info text
            });
        }

        if (cancelNameBtn) {
            cancelNameBtn.addEventListener('click', () => {
                profileNameInput.value = originalUserName;
                profileNameInput.disabled = true;
                editNameBtn.classList.remove('hidden');
                saveNameBtn.classList.add('hidden');
                cancelNameBtn.classList.add('hidden');
                settingsFeedback.classList.add('hidden'); // Hide feedback
            });
        }

        // --- Password Edit Logic ---
        if (editPasswordBtn) {
            editPasswordBtn.addEventListener('click', () => {
                if (currentUserSettings.passwordChangedThisMonth) {
                    showFeedback(settingsFeedback, "Passwort kann nur 1x pro Monat geändert werden.", true);
                    return;
                }
                profilePasswordInput.classList.add('hidden'); // Hide masked password
                passwordConfirmationFields.classList.remove('hidden');
                editPasswordBtn.classList.add('hidden');
                savePasswordBtn.classList.remove('hidden');
                cancelPasswordBtn.classList.remove('hidden');
                oldPasswordInput.focus();
            });
        }

        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => {
                const oldPassword = oldPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmNewPassword = confirmNewPasswordInput.value;

                if (!oldPassword || !newPassword || !confirmNewPassword) {
                    showFeedback(settingsFeedback, "Bitte fülle alle Passwortfelder aus.", true);
                    return;
                }

                const users = getUsers();
                const user = users[currentUser.username];

                if (user.password !== oldPassword) {
                    showFeedback(settingsFeedback, "Altes Passwort ist falsch.", true);
                    return;
                }

                if (newPassword.length < 6) { // Minimum password length
                    showFeedback(settingsFeedback, "Neues Passwort muss mindestens 6 Zeichen lang sein.", true);
                    return;
                }

                if (newPassword !== confirmNewPassword) {
                    showFeedback(settingsFeedback, "Neue Passwörter stimmen nicht überein.", true);
                    return;
                }
                if (newPassword === oldPassword) {
                    showFeedback(settingsFeedback, "Neues Passwort darf nicht das alte Passwort sein.", true);
                    return;
                }

                // Update password
                user.password = newPassword;
                saveUsers(users);

                // Update user settings for password change
                currentUserSettings.passwordChangedThisMonth = true;
                currentUserSettings.passwordLastChange = Date.now();
                saveUserSettings(currentUser.username, currentUserSettings);

                showFeedback(settingsFeedback, "Passwort erfolgreich geändert!", false);
                cancelPasswordBtn.click(); // Reset fields and buttons
                updatePasswordChangeInfo(); // Update info text and button state
            });
        }

        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', () => {
                profilePasswordInput.classList.remove('hidden'); // Show masked password
                passwordConfirmationFields.classList.add('hidden');
                editPasswordBtn.classList.remove('hidden');
                savePasswordBtn.classList.add('hidden');
                cancelPasswordBtn.classList.add('hidden');
                oldPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                settingsFeedback.classList.add('hidden'); // Hide feedback
            });
        }

        // --- Class Edit Logic ---
        if (editClassBtn) {
            editClassBtn.addEventListener('click', () => {
                profileClassSelect.disabled = false;
                editClassBtn.classList.add('hidden');
                saveClassBtn.classList.remove('hidden');
                cancelClassBtn.classList.remove('hidden');
            });
        }

        if (saveClassBtn) {
            saveClassBtn.addEventListener('click', () => {
                const newClass = profileClassSelect.value;
                if (newClass === originalUserClass) {
                    showFeedback(settingsFeedback, "Klasse wurde nicht geändert.", false);
                    cancelClassBtn.click();
                    return;
                }

                const users = getUsers();
                users[currentUser.username].class = newClass;
                saveUsers(users);

                // Update current user in localStorage
                setCurrentUser({ username: currentUser.username, class: newClass });

                showFeedback(settingsFeedback, "Klasse erfolgreich geändert!", false);
                profileClassSelect.disabled = true;
                editClassBtn.classList.remove('hidden');
                saveClassBtn.classList.add('hidden');
                cancelClassBtn.classList.add('hidden');
                originalUserClass = newClass; // Update original class
            });
        }

        if (cancelClassBtn) {
            cancelClassBtn.addEventListener('click', () => {
                profileClassSelect.value = originalUserClass;
                profileClassSelect.disabled = true;
                editClassBtn.classList.remove('hidden');
                saveClassBtn.classList.add('hidden');
                cancelClassBtn.classList.add('hidden');
                settingsFeedback.classList.add('hidden'); // Hide feedback
            });
        }

        if (backToSubjectsBtn) {
            backToSubjectsBtn.addEventListener('click', () => {
                console.log("DEBUG: 'Zurück zur Fächerwahl' button clicked from profile.");
                window.location.href = 'subject_selection.html';
            });
        }

        loadProfileStats(); // Load and display stats when on profile page
        loadUserSettingsForProfile(); // Load and display editable settings

        setupBreadcrumbNav([
            { name: 'Start', url: 'subject_selection.html' },
            { name: 'Fächer', url: 'subject_selection.html' },
            { name: 'Profil', url: 'profile.html' }
        ]);
    }
});