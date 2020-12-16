"use stric;";
var debug = true;

function debugMe(...debugText){

    if(debug == true ){
       // document.write("<span class='debug'>" + debugText + "</span><br>");
       console.log(...debugText);
    }
}

class Tile{
    constructor(id, div, imgPath, offsetx, offsety, szerokosc, wysokosc){
        this.id = id
        this.div = div
        this.imgPath = imgPath
        this.offsetx = offsetx
        this.offsety = offsety
        this.szerokosc = szerokosc
        this.wysokosc = wysokosc

        debugMe("zakladam plytke o id: " + this.id)
        this.imgDiv = document.createElement("div")
        this.imgDiv.className = 'cropped'
        this.imgDiv.id = id
        this.imgDiv.style.width = this.szerokosc + "px"
        this.imgDiv.style.height = this.wysokosc + "px"
 
        this.tileImg = document.createElement("img")
        this.tileImg.src=this.imgPath
        this.tileImg.className = 'plytka'
        this.tileImg.style.marginLeft = (-offsetx) + "px"
        this.tileImg.style.marginTop = (-offsety) + "px"

        this.imgDiv.appendChild(this.tileImg)
        div.appendChild(this.imgDiv)

        debugMe(this)
    }
}

class Slider{
    constructor(n, imgPath, divId, msgId){
        this.n = n
        this.imgPath = imgPath
        this.divId = document.getElementById(divId)
        this.msgId = document.getElementById(msgId)
        let style = getComputedStyle(this.divId)
        this.szerokosc = parseInt(style.width)
        this.us = this.szerokosc / this.n
        this.wysokosc = parseInt(style.height)
        this.uw = this.wysokosc / this.n
        debugMe(this)
        this.tiles = []
        this.divId.innerHTML = ''
        for (let x = 0; x < this.n; x++){
            this.tiles.push(new Array(this.n))
            for (let y = 0; y < this.n; y++){
                let src = '';
                if (x== this.n -1 && y == this.n - 1){
                    src = './img/black.png'
                } else {
                    src = this.imgPath;
                }
                this.tiles[x][y] = new Tile(y * this.n + x, this.divId, src, x*this.us, y*this.uw, this.us, this.uw)
                this.tiles[x][y].imgDiv.style.left = (x * this.us) + "px"
                this.tiles[x][y].imgDiv.style.top = (y * this.uw) + "px"
            }
        }
        this.blank = {x: this.n - 1, y: this.n - 1}
        this.msgBoxOff();
        let that = this
        this.divId.addEventListener("click",function(event){
            if(that.gameOver == false){
                const rect = that.divId.getBoundingClientRect();
                const mx = event.clientX - rect.x
                const my = event.clientY - rect.y
                const x = Math.floor(mx/that.us)
                const y = Math.floor(my/that.uw)
                debugMe(x,y)
                that.swap(x,y)
                if(that.czyKoniec()){
                    timer.stop()
                    that.stopGame()
                    scores.addScores(that.n, timer.getElapsedInterval())
                    that.msgBoxOn("gra skonczona!")
                }
            } else {
                debugMe("gra juz skonczona, ignoruje klik")
            }
        })
        this.gameOver = false;
    }

    stopGame(){
        this.gameOver = true;
    }

    msgBoxOn(msg){
        // this.msgId.innerHTML = msg;
        scores.updateScores()
        this.msgId.style.visibility = 'visible'
    }    
    
    msgBoxOff(){
        // this.msgId.innerHTML = '';
        this.msgId.style.visibility = 'hidden'
    }
    czyKoniec(){
        for (let x = 0; x < this.n; x++){
            for (let y = 0; y < this.n; y++){
                if(this.tiles[x][y].id !== y * this.n + x){
                    return false
                }
            }
        }
        return true
    }

    swap(x, y){
        debugMe("swapuje x: " + x + " y: " + y + ", blank: ", this.blank)
        if (x < 0 || y < 0 || x >= this.n || y >= this.n){
            debugMe(`współrzędne poza zakresem, x: ${x}, y: ${y}`)
            return false
        }
        let jestOK = false;
        if (x == this.blank.x){
            if (y == this.blank.y - 1 || y == this.blank.y + 1){
                jestOK = true;
            }
        } else if (y == this.blank.y){
            if (x == this.blank.x - 1 || x == this.blank.x + 1){
                jestOK = true;
            }
        }
        if (jestOK){
            let elem1 = this.tiles[x][y]
            let blank = this.tiles[this.blank.x][this.blank.y]
            debugMe('zamieniam miejscami element ' + elem1.id + ' z elementem blank: ' + blank.id)
            const oldBlankx = this.blank.x
            const oldBlanky = this.blank.y
            //podmiana w tablicy
            this.tiles[x][y] = blank
            this.tiles[this.blank.x][this.blank.y] = elem1
            this.blank.x = x
            this.blank.y = y
            //podmiana na ekranie
            blank.imgDiv.style.left = (x * this.us) + "px"
            blank.imgDiv.style.top = (y * this.uw) + "px"
            elem1.imgDiv.style.left = (oldBlankx * this.us) + "px"
            elem1.imgDiv.style.top = (oldBlanky * this.uw) + "px"
            debugMe('zamienilem miejscami element ' + elem1.id + ' z elementem blank: ' + blank.id, elem1, blank    )

        }

        return true
    }
    async randomize(w){
        for (let i = 0; i < w; i++){
            let random = Math.floor(100 * Math.random())
            debugMe("random: " + random)
            if (random >= 0 && random < 15){
                this.swap(this.blank.x + 1, this.blank.y)
            } else if (random >= 15 && random < 50){
                this.swap(this.blank.x - 1, this.blank.y)
            } else if (random >= 50 && random < 65){
                this.swap(this.blank.x, this.blank.y + 1)
            } else if(random >= 65 && random < 100){
                this.swap(this.blank.x, this.blank.y - 1)
            }
            let cokolwiek = await new Promise(function(resolve){
                var timerHandle = setTimeout(function(){
                    clearTimeout(timerHandle)
                    resolve(null)
                }, 20)
            })
        }
    }
}

class Scores{
    constructor(scoresId){
        this.scoresId = document.getElementById(scoresId)
        const cookieval = this.getCookie('scores')
        debugMe ('cookieval: >>'+cookieval+'<<')
        if(cookieval != ''){
            let storedScores = JSON.parse(cookieval)
            debugMe('byly zapisy w cookie')
            this.scores = storedScores;
        } else {
            this.scores = {n2: null, n3: null, n4: null, n5: null, n6: null}
            this.scores.n2 = new Array()
            this.scores.n3 = new Array()
            this.scores.n4 = new Array()
            this.scores.n5 = new Array()
            this.scores.n6 = new Array()
            debugMe('no cookie stored with scores')
        }
        debugMe('startuje z tymi notami:',this.scores)
    }

    addScores(wymiar, wynikMsecs){
        let tab = new Array()
        if (wymiar == 2){
            tab = this.scores.n2
        } else if (wymiar == 3){
            tab = this.scores.n3
        } else if (wymiar == 4){
            tab = this.scores.n4
        } else if (wymiar == 5){
            tab = this.scores.n5
        } else if (wymiar == 6){
            tab = this.scores.n6
        }

        let wynik = new Array()
        tab.forEach((element, idx) => {wynik.push(element)})
        wynik.push(wynikMsecs)
        wynik.sort(function(elem1, elem2){
            return elem1 - elem2;
        })
        tab.length = 0
        wynik.forEach((element, idx) =>  {if (idx < 10){
            tab.push(element)
        }})

        var cookieval = JSON.stringify(this.scores)
        this.setCookie('scores',cookieval, 100)
    }

    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    formatTime(msecs){
        let interval
        if (msecs === 'undefined') {
            interval = 0;
        } else {
            interval = msecs
        }
        let elapsedTime = new Date(interval)
        let html = ''
        if (interval > 0){
            html = 
            this.pad(elapsedTime.getUTCHours(),2) + `:` 
            + this.pad(elapsedTime.getUTCMinutes(),2) + `:`
            + this.pad(elapsedTime.getUTCSeconds(),2) + `:`
            + this.pad(elapsedTime.getUTCMilliseconds(),3)
        } else {
            html = '-'
        }
        return html;
    }

    updateScores(){
        debugMe('scores',this.scores, this.scores.n3, this.scores.n3[0])
        let html = `<table>`
        html += `<tr><td class="nTd">3x3</td><td class="nTd">4x4</td><td class="nTd">5x5</td><td class="nTd">6x6</td></tr>`
        for (let i = 0; i < 10; i++){
            html += `<tr><td class="wynikTd">` + this.formatTime(this.scores.n3[i]) + 
            `</td><td class="wynikTd">` + this.formatTime(this.scores.n4[i]) +
            `</td><td class="wynikTd">` + this.formatTime(this.scores.n5[i]) + 
            `</td><td class="wynikTd">` + this.formatTime(this.scores.n6[i]) + `</td></tr>`
        }
        html += `</table>`
        this.scoresId.innerHTML = html
    }

    setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        const cookiestring = cname + "=" + cvalue + ";" + expires + ";path=/";
        document.cookie = cookiestring
        debugMe('saved cookie',cookiestring)
    }
      
    getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }
      
}

class Timer{
    constructor(divId){
        this.divId = document.getElementById(divId)
        this.started = false;
        this.zero()
    }

    zero(){
        this.stop()
        this.startDate = null;
        this.printDate()
    }

    start(){
        this.zero()
        this.startDate = new Date()
        this.stopDate = null
        this.printDate()
        this.continousUpdate(97)
    }

    getElapsedInterval(){
        const now = new Date()
        let interval;
        if(this.startDate){
            if(this.stopDate){
                interval = this.stopDate.getTime() - this.startDate.getTime()
            } else {
                interval = now.getTime() - this.startDate.getTime()
            }
        } else {
            interval = 0
        }
        return interval
    }

    getElapsedTime(){
        const interval = this.getElapsedInterval()
        const timeElapsed = new Date(interval)
        return timeElapsed
    }

    printDigit(value){
        let html = `<img src="./img/c${value}.gif"/>`
        return html
    }
    print2Digits(value){
        let html = ''        
        const d1 = Math.floor(value/10)
        const d2 = value % 10
        html += this.printDigit(d1)
        html += this.printDigit(d2)
        return html
    }

    print3Digits(value){
        let html = ''
        const d1 = Math.floor(value/100)
        const d2 = Math.floor(value/10) % 10
        const d3 = value % 10
        html += this.printDigit(d1)
        html += this.printDigit(d2)
        html += this.printDigit(d3)
        return html
    }

    printDate(){
        const elapsedTime = this.getElapsedTime()
        // debugMe(elapsedTime, this)
        let html = 
            this.print2Digits(elapsedTime.getUTCHours()) + `<img src="./img/colon.gif"/>` 
            + this.print2Digits(elapsedTime.getUTCMinutes()) + `<img src="./img/colon.gif"/>`
            + this.print2Digits(elapsedTime.getUTCSeconds()) + `<img src="./img/colon.gif"/>`
            + this.print3Digits(elapsedTime.getUTCMilliseconds())
        this.divId.innerHTML = html
    }
    
    continousUpdate(milisecs){
        const that = this
        this.timeoutHandle = setInterval(function(){
            that.printDate()
        }, milisecs)    

    }
    stop(){
        this.stopDate = new Date()
        this.printDate()
        clearInterval(this.timeoutHandle)
    }
}

class Selector{
    constructor(className){
        this.className = className;
        this.nrSlajdu = 1;
        this.wyswietlSlajd(this.nrSlajdu)
    }
    
    sliderMove(i){
        this.nrSlajdu += i
        this.wyswietlSlajd()
    }

    /*
    setSlide(i){
        this.nrSlajdu = i
        this.wyswietlSlajd()
    }
    */

    getImgPath(){
        let slides = document.getElementsByClassName(this.className)
        let slide = slides[this.nrSlajdu - 1]
        debugMe(slide.src)
        return slide.src
    }

    wyswietlSlajd(){
        let i
        let slides = document.getElementsByClassName(this.className)
        debugMe('slajdy: ', slides)
        if (this.nrSlajdu > slides.length) {
            this.nrSlajdu = 1;
        }
        if (this.nrSlajdu < 1){
            this.nrSlajdu = slides.length;
        }
        debugMe("wyswietlam slajd ",this.nrSlajdu)
        slides[this.nrSlajdu - 1].scrollIntoView({behavior: "smooth", inline:'start', block: 'center'})
    }
}

let slider = null;
let timer = null;
let scores = null;
let selector = null;

function runMeOnce(zegarId, scoresId, sliderClassName){
    timer = new Timer(zegarId)
    scores = new Scores(scoresId)
    selector = new Selector(sliderClassName)
}

async function runMe(n, img, sliderid, msgboxid, zegarId, scoresId){
    if (timer == null){
        timer = new Timer(zegarId)
    }
    timer.zero()
    if(slider != null){
        debugMe("zatrzymuje stara gre",slider)
        slider.stopGame()
    }
    const filePath = selector.getImgPath()
    slider = new Slider(n, filePath, sliderid, msgboxid)
    await slider.randomize(2)
    timer.start()
}

function sliderMove(n){
    selector.sliderMove(n)
}