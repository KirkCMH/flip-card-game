// 定義遊戲狀態狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

// each suit of cards
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// place card function in object
// MVC裡的V
const view = {
  getCardContent(index) {
    const number = this.transFormNumberToLetter((index % 13) + 1)
    const symbols = Symbols[Math.floor(index / 13)]
    return `<P class="number">${number}</P>
          <img src=${symbols} alt="" class="suit">
          <P class="number">${number}</P>    
    `
  },

  getCardElement(index) {
    return `<div data-index="${index} "class="card back"></div>`
  },

  transFormNumberToLetter(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // remember adding "comma" between every object items

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards');
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index))
      .join('')
  },

  flipCards(...cards) {
    cards.map(card => {
    if (card.classList.contains('back')) {
      // 翻到正面
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(card.dataset.index)
      return
    }
    // 回傳背面
    card.classList.add('back')
    card.innerHTML = null
  })

  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score){
    const scores = document.querySelector('.score')
    scores.innerHTML = `Score: ${score}`
  },

  renderAttempts(attempt){
    const attempts = document.querySelector('.attempt')
    attempts.innerHTML = `You've Tried: ${attempt} times `
  },

  addWrongAnimation(...cards){
    cards.map((card, index) =>{
      card.classList.add('wrong')
      card.addEventListener('animationend', (e) =>
        e.target.classList.remove('wrong'),{once: true})
    }) 
  },

  showGameFinished(){
    const div = document.createElement('div')
    div.classList.add('game-finished')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>      
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

}


// 儲存翻開的卡片
const model = {
  revealCards: [],

  isRevealCardMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },

  //計分
  score: 0,
  // 計算嘗試次數
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做出不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      // 第一個狀態
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      // 第二個狀態
      case GAME_STATE.SecondCardAwaits:
        view.renderAttempts(++model.triedTimes)
        view.flipCards(card)
        model.revealCards.push(card)
        if (model.isRevealCardMatched()) {
          // 配對正確
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealCards)
          view.renderScore(model.score += 10)
          model.revealCards = []
          if (model.score === 260){
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.addWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000) 
        }
        break
    }
    console.log('current state:', this.currentState)
    console.log('revealed:', model.revealCards)
  },

  resetCards(){
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}

// 外掛函式庫模組
const utility = {
  getRandomNumberArray(count) {
    // 洗牌
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index >= 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  },
}

controller.generateCards()

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', (e) => {
    controller.dispatchCardAction(card)
    
  })
})

/////// or 在cards上監聽，用target去抓值
// document.querySelector('#cards').addEventListener('click', (e) => {
//   view.flipCards(e.target)
// })
