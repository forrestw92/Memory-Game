const Controller = {
    playSound: function (sound) {
        if (Model.gameInfo.hasSound && View.sounds[sound] !== undefined) {
            View.sounds[sound].play();
        }
    },

    getCardIcons: function () {
        return Model.cards;
    },
    getCards: function () {
        return Model.cards;
    },

    getGameStarted: function () {
        return Model.gameInfo.gameStarted;
    },
    loadSave: function () {
        return Model.loadGame();
    },
    updateSound: function (value) {
        Model.gameInfo.hasSound = value;
    },
    updateTimer: function (playTimer) {
        let timeString = this.timeCaculate(playTimer);
        if (timeString && !isNaN(playTimer.minutes) && !isNaN(playTimer.seconds)) {
            View.updateTimer(timeString);
        }
    },
    startGameTimer: function () {
        Model.startGameTimer();
    },
    /**
     * @param  {Object} PlayTime
     * @returns {String} String format $Minutes m $Seconds s
     */
    timeCaculate: function (playTime) {
        if (playTime === undefined || playTime.minutes === undefined || playTime.seconds === undefined) {
            return false;
        }
        let timeString = "";
        if (playTime.minutes === 0) {
            timeString = playTime.seconds + "s";
        } else {
            timeString = playTime.minutes + "m " + playTime.seconds + "s";
        }
        return timeString;
    },
    getDifficulty: function () {
        return Model.gameInfo.difficulty;
    },
    updateDifficulty: function (difficulty) {
        Model.gameInfo.difficulty = difficulty;
    },
    updateMoves: function (moves) {
        if (moves !== undefined) {
            View.updateMoves(moves);
        }
    },
    updateScore: function (score) {
        View.updateScore(score);
    },
    onCardClick: function (el) {
        if (!Model.gameInfo.canOpenCard) {
            return false;
        }
        if (Model.addOpenCard(el.firstChild.className, el)) {
            Controller.addMatchedCards(el.firstChild.className);
        }

    },
    clearOpenedCards: function () {
        View.update();
    },

    /**
     * Saves element style order into array
     * @param  {String} card Key of Model Cards
     * @param  {Number} index Element style order
     */
    addCardPosition: function (card, index) {
        if (Model.cards[card].order === undefined || Model.cards[card].order.length === 2) {
            Model.cards[card].order = [];
        }
        Model.cards[card].order.push({
            index: index,
            opened: false
        });
        Model.cards[card].isMatched = false;
    },
    addOpenedCard: function (el) {
        View.openCard(el);
    },

    addMatchedCards: function (card) {
        View.showMatchedCards(card);
    },


    gameOver: function (moves, playTime, score) {
        View.gameOver(moves, this.timeCaculate(playTime), score);
    },
    gameStarted: function () {
        if (!Model.gameInfo.gameStarted) {
            Model.gameInfo.gameStarted = true;
            return true;
        }
        return false;
    },
    restartGame: function () {
        if (View.allowReset) {
            Model.gameInfo.gameStarted = false;
            Model.resetCards();
            Model.init();
            View.restartGame();
        }
    },

    init: function () {
        Model.init();
        if (Model.checkSavedGame()) {
            View.activateResumeButton();
        }
        View.init(true);
    }

};
const View = {
    allowReset: true,
    sounds: {
        win: undefined,
        match: undefined,
        misMatch: undefined,
        closeFlip: undefined,
        flipOver: undefined,
        slide: undefined,
        init: function () {
            this.slide = new Audio('sounds/slide.mp3');
            this.closeFlip = new Audio('sounds/closeFlip.mp3');
            this.flipOver = new Audio('sounds/flipOver.mp3');
            this.win = new Audio('sounds/win.mp3');
            this.match = new Audio('sounds/match.mp3');
            this.misMatch = new Audio('sounds/misMatch.mp3');
        }
    },
    deck: {
        children: document.querySelectorAll(".deck .card"),
        parent: document.querySelector(".deck"),
    },
    buttons: {
        startButton: document.querySelector(".start"),
        restartButtons: document.querySelectorAll(".restart"),
        resumeButton: document.querySelector(".resume-game"),
        difficultyButtons: document.querySelectorAll(".btn-group button"),
        soundButton: document.querySelector(".sound"),
        modalClose: document.querySelector(".modal-close")
    },
    gameOverModal: {
        body: document.querySelector(".modal-body"),
        parent: document.querySelector(".modal"),
        overlay: document.querySelector(".modal-overlay")
    },
    scorePanel: {
        parent: document.querySelector(".score-panel"),
        moves: document.querySelector(".score-panel .moves"),
        stars: document.querySelector(".score-panel .stars"),
        timer: document.querySelector(".score-panel .timer")
    },
    panels: {
        scorePanel: document.querySelector(".score-panel"),

        starsPanel: document.querySelector(".stars"),
        gameOverPanel: document.querySelector(".game-over"),
        gameActions: document.querySelector(".game-actions")
    },
    addClass: function (el, newClass) {
        if (el !== undefined) {
            el.className = el.className + " " + newClass;
        }
    },
    removeClass: function (el, className, replace) {
        if (el !== undefined) {
            el.className = el.className.replace(className, (replace !== undefined) ? replace : "").trim();

        }
    },

    activateResumeButton: function () {
        this.buttons.resumeButton.addEventListener("click", this.resumeGame);
        this.removeClass(this.buttons.resumeButton, "hide");
    },
    updateSound: function (value) {
        if (value) {
            this.sounds.init();
        } else {
            this.sounds.destroy();
        }
    },
    updateTimer: function (timerString) {
        this.scorePanel.timer.textContent = timerString;
    },
    updateMoves: function (moves) {
        this.scorePanel.moves.textContent = moves + " Moves";
    },
    updateScore: function (score) {
        let stars = this.scorePanel.stars;
        switch (score) {
            case 0:
                this.addClass(stars.children[0], "remove");
                break;
            case 1:
                this.addClass(stars.children[1], "remove");
                break;
            case 2:
                this.addClass(stars.children[2], "remove");
                break;
            default:
                Array.from(stars.children).forEach(function (el) {
                    View.removeClass(el, "remove");
                });
                break;
        }
    },
    createElement: function (nodeType, className, textContent) {
        let element = document.createElement(nodeType);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    },

    gameOverDetails: function (moves, time, score) {
        if (View.gameOverModal.body.getElementsByClassName("score")[0].innerHTML !== "") {
            View.gameOverModal.body.getElementsByClassName("score")[0].innerHTML = "";
            return true;
        }
        View.gameOverModal.body.getElementsByClassName("moves")[0].textContent = moves + " Moves";
        View.gameOverModal.body.getElementsByClassName("time")[0].textContent = time;
        View.gameOverModal.body.getElementsByClassName("score")[0].appendChild(score);
    },

    /**
     * Game over overlay screen
     * @param  {Number} moves
     * @param  {String} playTime
     * @param  {Number} score
     */
    gameOver: function (moves, playTime, score) {

        let frag = document.createDocumentFragment();
        this.removeClass(this.gameOverModal.parent, "hide");
        this.removeClass(this.gameOverModal.overlay, "hide");
        for (var i = 0; i < score; i++) {
            let star = this.createElement("i", "fa fa-star");
            frag.appendChild(star);
        }
        this.gameOverDetails(moves, playTime, frag);
        Array.from(View.gameOverModal.body.children).forEach(function (el, idx) {
            setTimeout(function () {
                el.className = el.className.replace("hidden", "");
            }, 500 + (500 * idx));
        });
    },

    handleClick: function (el) {
        if (this.className.indexOf("open") <= -1 && this.className.indexOf("match") <= -1) {
            Controller.onCardClick(this);
        }
    },
    handleSoundButton: function (el) {
        let soundIcon = this.childNodes[1];
        if (soundIcon.className.indexOf("fa-volume-up") > -1) {
            View.removeClass(soundIcon, "fa-volume-up", "fa-volume-off");
            Controller.updateSound(false);
        } else {
            View.removeClass(soundIcon, "fa-volume-off", "fa-volume-up");
            Controller.updateSound(true);
        }
    },
    handleDifficultyButtons: function (el) {
        let currentDifficulty = Controller.getDifficulty();
        let currentDifficultyElement = document.getElementById(currentDifficulty);
        if (currentDifficulty !== this.id) {
            View.removeClass(currentDifficultyElement, "active");
            View.addClass(this, "active");
        }
        switch (this.id) {
            case "easy":
                Controller.updateDifficulty(this.id);
                break;
            case "medium":
                Controller.updateDifficulty(this.id);
                break;
            case "hard":
                Controller.updateDifficulty(this.id);
                break;
        }
    },
    handleStartButton: function (el) {
        View.addClass(View.panels.gameActions, "hide");
        View.deck.parent.className = "deck";
        View.render();
    },
    handleModalClose: function (el) {
        View.addClass(View.gameOverModal.overlay, "hide");
        View.addClass(View.gameOverModal.parent, "hide");
        View.addClass(View.gameOverModal.body.getElementsByClassName("moves")[0], "hidden");
        View.addClass(View.gameOverModal.body.getElementsByClassName("time")[0], "hidden");
        View.addClass(View.gameOverModal.body.getElementsByClassName("score")[0], "hidden");
    },
    resumeGame: function (el) {
        View.addClass(View.panels.gameActions, "hide");
        View.deck.parent.className = "deck";
        if (Controller.loadSave()) {
            setTimeout(function () {
                View.render(true);
            }, 100);
        }
    },

    /**
     * Gets all Cards key values,doubles keys and shuffles them
     * @returns {Array} Shuffled cards
     */
    randomizeIcons: function () {
        let cards = Controller.getCardIcons();
        let keys = [];
        for (let card in cards) {
            keys.push(card);
        }
        let shuffled = keys.concat(keys);
        /*
        Reference https://stackoverflow.com/a/18650169
        */
        shuffled = shuffled.sort(function () {
            return 0.5 - Math.random();
        });
        return shuffled;
    },
    /**
     * Loops each .card li element and finds the matching object from Model.cards. Updates order style from found info
     * and shows any matching cards.
     */
    loadShuffledDeck: function () {
        let eCards = Controller.getCards();
        let copy = [];

        Array.from(this.deck.children).forEach(function (el, idx) {
            let index = Object.keys(eCards).reduce(function (cards, icon, index) {
                if (eCards[icon] !== undefined && eCards[icon].icon === el.childNodes[0].className) {
                    cards.push({
                        isMatched: eCards[icon].isMatched,
                        index: icon,
                        icon: eCards[icon].icon,
                        order: eCards[icon].order
                    });
                }
                return cards;
            }, []);
            if (index[0].icon === el.childNodes[0].className) {
                View.deck.children[idx].style.order = (copy.indexOf(index[0].order[0].index) === -1) ? index[0].order[0].index : index[0].order[1].index;
                copy.push(index[0].order[0].index);
            }

            if (index[0].isMatched) {
                setTimeout(function () {
                    View.showMatchedCards(index[0].icon);
                }, 300);
            }

        });
    },
    /**
     * Checks if the loaded data is valuable enough to load data from.
     */
    checkLoadData: function () {
        return (Controller.getCards()[Object.keys(Controller.getCards())[0]].order[0] !== undefined) ? true : false;
    },
    shuffleClosedCards: function (loadedDeck) {
        let icons = this.randomizeIcons();
        if (loadedDeck && this.checkLoadData()) {
            this.loadShuffledDeck();
        } else {
            /**
             * Loops all card li elements and finds matching info from Model.cards.
             * Saves and updates the order of the card from shuffled icons
             */
            Array.from(this.deck.children).forEach(function (el, idx) {
                let index = icons.reduce(function (cards, icon, index) {
                    if (Controller.getCards()[icon] !== undefined && Controller.getCards()[icon].icon === el.childNodes[0].className) {
                        cards.push({
                            icon: icon,
                            index: index
                        });
                    }
                    return cards;
                }, []);
                if (Controller.getCards()[index[0].icon].icon === el.childNodes[0].className) {
                    View.deck.children[idx].style.order = index[0].index + 1;
                    Controller.addCardPosition(index[0].icon, index[0].index + 1);
                    icons[index[0].index] = "";
                }
            });
        }
    },

    showMatchedCards: function (card) {
        let matchedCards = document.querySelectorAll(card.replace("fa ", " ."));
        Array.from(matchedCards).forEach(function (el) {
            el.parentElement.className = "card match";
        });
        this.update();
    },



    closeCards: function () {
        View.allowReset = false;
        setTimeout(function () {
            Array.from(View.deck.children).forEach(function (el, idx) {
                setTimeout(function () {
                    el.className = "card";
                    Controller.playSound("closeFlip");
                    if (idx === Array.from(View.deck.children).length - 1) {
                        View.allowReset = true;
                    }
                }, 400 * idx);
            });
        }, 1000);

    },

    openCard: function (e) {
        e.className = "card open";
    },
    restartGame: function () {
        if (!Controller.getGameStarted()) {
            View.addClass(View.panels.gameActions, (View.panels.gameActions.className.indexOf("hide") === -1) ? View.panels.gameActions.className + " hide" : View.panels.gameActions.className);
            View.addClass(View.gameOverModal.parent, "hide");
            View.addClass(View.gameOverModal.overlay, "hide");
            View.init();
            View.render();
        }
    },
    createCards: function () {
        let icons = this.randomizeIcons();
        let frag = document.createDocumentFragment();
        let cards = Object.keys(Controller.getCards()).map(function (cards) {
            return cards;
        });
        this.deck.parent.innerHTML = "";
        cards = cards.concat(cards);
        icons.forEach(function (el, idx) {
            let li = View.createElement('li', "card open");
            let back = View.createElement('div', "back");
            let icon = View.createElement('i', Controller.getCards()[el].icon);
            li.style.order = idx + 1;
            li.appendChild(icon);
            li.appendChild(back);
            frag.appendChild(li);
        });
        this.deck.parent.appendChild(frag);
    },
    init: function (firstTime) {
        this.createCards();
        View.deck.children = document.querySelectorAll(".deck .card");
        if (firstTime) {
            this.sounds.init();
            Array.from(this.buttons.difficultyButtons).forEach(function (el) {
                el.addEventListener("click", View.handleDifficultyButtons);
            });
            this.buttons.soundButton.addEventListener("click", this.handleSoundButton);
            this.buttons.startButton.addEventListener("click", this.handleStartButton);
            this.buttons.modalClose.addEventListener("click", this.handleModalClose);
        }
    },
    update: function () {
        Array.from(this.deck.children).forEach(function (el, idx) {
            if (el.className.indexOf("match") <= -1) {
                el.className = "card";
            }
        });
    },
    render: function (loadedDeck) {
        View.removeClass(View.scorePanel.parent, "hide");
        View.removeClass(View.buttons.soundButton, "hide");
        this.closeCards();
        setTimeout(function () {
            View.shuffleClosedCards(loadedDeck);
            if (Controller.gameStarted()) {
                Array.from(View.buttons.restartButtons).forEach(function (el) {
                    el.addEventListener("click", Controller.restartGame);
                });
                Array.from(View.deck.children).forEach(function (el) {
                    el.addEventListener("click", View.handleClick);
                });
                if (loadedDeck) {
                    Controller.startGameTimer();
                }
            }
        }, 1000 + (Object.keys(Controller.getCards()).length * 2 * 430));
    }

};
const Model = {
    cards: {
        diamond: {
            icon: "fa fa-diamond"
        },
        plane: {
            icon: "fa fa-paper-plane-o"
        },
        anchor: {
            icon: "fa fa-anchor"
        },
        bolt: {
            icon: "fa fa-bolt"
        },
        cube: {
            icon: "fa fa-cube"
        },
        leaf: {
            icon: "fa fa-leaf"
        },
        bicycle: {
            icon: "fa fa-bicycle"
        },
        bomb: {
            icon: "fa fa-bomb"
        }
    },
    gameInfo: {
        playTime: {
            minutes: 0,
            seconds: 0,
        },
        canOpenCard: true,
        hasSound: true,
        gameStarted: false,
        difficulty: "easy",
        score: 3,
        currentMoves: 0,
        startTime: undefined,
        gameTimer: undefined,
        loadedSaveTime: undefined,
        scoreTimer: undefined
    },
    delayOpenCard: function () {
        setTimeout(function () {
            if (!Model.gameInfo.canOpenCard) {
                let openedCards = Model.getOpenedCards();
                Model.gameInfo.canOpenCard = true;
                Model.clearOpenCards(openedCards);
                Controller.clearOpenedCards();
            }
        }, 1000);
    },

    startGameTimer: function () {
        this.gameInfo.gameTimer = setInterval(function () {
            let timeNow = Date.now();
            Controller.updateTimer(Model.gameInfo.playTime);
            if (Model.gameInfo.playTime.seconds === 59) {
                Model.gameInfo.playTime.seconds = 0;
                Model.gameInfo.playTime.minutes++;
            }
            Model.gameInfo.playTime.seconds++;
        }, 1000);
    },
    stopGameTimer: function () {
        this.gameInfo.startTime = undefined;
        clearInterval(this.gameInfo.gameTimer);
    },
    checkSavedGame: function () {
        if(localStorage.getItem("memory-game-save") === undefined || localStorage.getItem("memory-game-save") === null){
            return false;
        }
        if (this.getMatchedCards(JSON.parse(localStorage.getItem("memory-game-save")).cards).length > 0) {
            return true;
        }
        return false;
    },
    saveGame: function () {
        if (window.localStorage) {
            localStorage.setItem("memory-game-save", JSON.stringify({
                cards: this.cards,
                currentMoves: this.gameInfo.currentMoves,
                score: this.gameInfo.score,
                playTime: this.gameInfo.playTime,
                scoreTimer: this.gameInfo.scoreTimer,
                startTime: this.gameInfo.startTime
            }));
        }
    },
    updateGameDetails: function () {
        Controller.updateMoves(this.gameInfo.currentMoves);
        Controller.updateScore(this.gameInfo.score);
        Controller.updateTimer(this.gameInfo.playTime);
    },
    loadGame: function () {
        if (window.localStorage) {
            if (localStorage.getItem("memory-game-save") !== undefined || localStorage.getItem("match-game-save").length !== "") {
                let parsedJson = JSON.parse(localStorage.getItem("memory-game-save"));
                this.cards = parsedJson.cards;
                this.gameInfo.currentMoves = parsedJson.currentMoves;
                this.gameInfo.score = parsedJson.score;
                this.gameInfo.playTime = parsedJson.playTime;
                this.gameInfo.startTime = parsedJson.startTime;
                this.updateGameDetails();
                return true;
            }
            return false;
        }
        return false;
    },

    getCardFromIcon: function (cardIcon) {
        return Object.keys(this.cards).filter(function (card) {
            return Model.cards[card].icon === cardIcon;
        });
    },
    getIconFromCard: function (cardName) {
        return Object.keys(Model.cards).map(function (card) {
            if (card === cardName) {
                return Model.cards[cardName].icon;
            }
        })[0];
    },

    getMatchedCards: function (cards) {
        if (cards === undefined) {
            cards = Model.cards;
        }
        return Object.keys(cards).reduce(function (opened, card, index) {
            if (cards[card].isMatched) {
                opened.push(card);
            }
            return opened;
        }, []);
    },
    getOpenedCards: function () {
        return Object.keys(Model.cards).reduce(function (opened, card, index) {
            if (Model.cards[card].order[0].opened === true && Model.cards[card].isMatched === false) {
                opened.push(card);
            }
            if (Model.cards[card].order[1].opened === true && Model.cards[card].isMatched === false) {
                opened.push(card);
            }
            return opened;
        }, []);
    },
    openCardByOrder: function (cardKey, order) {
        return this.cards[cardKey].order.find(function (card) {
            return card.index === parseInt(order);
        });
    },

    /**
     * Opens card and checks if card is matched with last open card.
     * Clears cards after 2 open cards
     * @param  {String} card
     * @param  {Object} el
     * @returns {Boolean} If matched cards true else false
     */
    addOpenCard: function (card, el) {
        if (this.gameInfo.startTime === undefined) {
            Model.gameInfo.startTime = Date.now();
            this.startGameTimer();
        }
        this.updateMoves();
        this.updateScore();
        let cardKey = this.getCardFromIcon(card);
        this.openCardByOrder(cardKey, el.style.order).opened = true;
        Controller.playSound("flipOver");
        Controller.addOpenedCard(el);
        let openedCards = this.getOpenedCards();
        if (this.checkMatchedCards(openedCards)) {
            Controller.addMatchedCards(el.childNodes[0].className);
            return true;
        }
        return false;
    },
    clearOpenCards: function (openedCards) {
        openedCards.forEach(function (card) {
            Model.cards[card].order[0].opened = false;
            Model.cards[card].order[1].opened = false;
        });
    },
    /**
     * If cards match reset timer and checks if game is over
     * @returns {Boolean} If cards match true else false
     */
    checkMatchedCards: function (openedCards) {
        if (openedCards.length < 2) {
            return false;
        }
        if (openedCards[0] === openedCards[1]) {
            Model.cards[openedCards[0]].isMatched = true;
            Controller.playSound("match");
            this.gameInfo.scoreTimer = Date.now();
            if (this.isGameOver()) {
                Controller.playSound("win");
                Controller.gameOver(this.gameInfo.currentMoves, this.gameInfo.playTime, this.gameInfo.score);
                this.resetGameInfo();
                return true;
            }
            Controller.clearOpenedCards();
            this.clearOpenCards(openedCards);

            return true;
        }
        Model.gameInfo.canOpenCard = false;
        this.delayOpenCard();
        Controller.playSound("misMatch");
        return false;
    },
    resetCards: function () {
        Object.keys(Model.cards).forEach(function (card) {
            Model.cards[card].isMatched = false;
            Model.cards[card].order = [];
        });
    },
    /**
     * Reduces score based on timer and max/min matches.
     */
    updateScore: function () {
        if (this.gameInfo.scoreTimer === undefined) {
            this.gameInfo.scoreTimer = Date.now();
        }

        let timeDiff = (Math.floor((Date.now() - this.gameInfo.scoreTimer) / 1000) % 60);
        let decreaseScore = function (asdf) {
            Model.gameInfo.score--;
            Controller.updateScore(Model.gameInfo.score);
            Model.gameInfo.scoreTimer = Date.now();
            console.log(asdf);
        };
        switch (this.gameInfo.difficulty) {
            case "easy":
                if ((this.gameInfo.currentMoves >= 17 && this.gameInfo.currentMoves < 34 && timeDiff >= 8)) {
                    decreaseScore(1);
                } else if ((this.gameInfo.currentMoves >= 34 && this.gameInfo.currentMoves <= 50 && timeDiff >= 6)) {
                    decreaseScore(2);
                } else if ((this.gameInfo.currentMoves >= 50 && timeDiff >= 4)) {
                    decreaseScore(3);
                }
                break;
            case "medium":
                if ((this.gameInfo.currentMoves >= 14 && this.gameInfo.currentMoves < 27 && timeDiff >= 8)) {
                    decreaseScore(1);
                } else if ((this.gameInfo.currentMoves >= 27 && this.gameInfo.currentMoves <= 40 && timeDiff >= 6)) {
                    decreaseScore(2);
                } else if ((this.gameInfo.currentMoves >= 40 && timeDiff >= 4)) {
                    decreaseScore(3);
                }
                break;
            case "hard":
                if ((this.gameInfo.currentMoves >= 10 && this.gameInfo.currentMoves < 20 && timeDiff >= 8)) {
                    decreaseScore(1);
                } else if ((this.gameInfo.currentMoves >= 20 && this.gameInfo.currentMoves <= 30 && timeDiff >= 6)) {
                    decreaseScore(2);
                } else if ((this.gameInfo.currentMoves >= 30 && timeDiff >= 4)) {
                    decreaseScore(3);
                }
                break;
        }
    },
    updateMoves: function () {
        this.gameInfo.currentMoves++;
        Controller.updateMoves(this.gameInfo.currentMoves);
    },

    resetGameInfo: function () {
        this.gameInfo.score = 3;
        this.gameInfo.currentMoves = 0;
        this.gameInfo.playTime.seconds = 0;
        this.gameInfo.playTime.minutes = 0;
        this.gameInfo.scoreTimer = undefined;
        this.resetCards();
        this.stopGameTimer();
        Controller.updateMoves(this.gameInfo.currentMoves);
        Controller.updateScore();
    },
    isGameOver: function () {
        let matched = Object.keys(Model.cards).filter(function (card) {
            return Model.cards[card].isMatched === true;
        });
        if (matched.length === Object.keys(Model.cards).length) {
            return true;
        }
        return false;
    },

    init: function () {
        this.resetCards();
        this.resetGameInfo();
        window.addEventListener("beforeunload", function (el) {
            Model.saveGame();
        });
    }
};
Controller.init();