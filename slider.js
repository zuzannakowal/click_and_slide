"use strict";
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
        for (let x = 0; x < this.n; x++){
            this.tiles.push(new Array(this.n))
            for (let y = 0; y < this.n; y++){
                let src = '';
                if (x== this.n -1 && y == this.n - 1){
                    src = './img/black.png'
                } else {
                    src = './img/kwiatki2.jpg';
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
            const rect = that.divId.getBoundingClientRect();
            const mx = event.clientX - rect.x
            const my = event.clientY - rect.y
            const x = Math.floor(mx/that.us)
            const y = Math.floor(my/that.uw)
            debugMe(x,y)
            that.swap(x,y)
            if(that.czyKoniec()){
                that.msgBoxOn("gra skonczona!")
            }
            
        })
    }

    msgBoxOn(msg){
        this.msgId.innerHTML = msg;
    }    
    
    msgBoxOff(){
        this.msgId.innerHTML = '';
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

    rysuj(){
        /*
        let html = `<table>`
        for (let y = 0; y < this.n; y++){
            html += `<tr>`
            for (let x = 0; x < this.n; x++){
                html += `<td>${this.tiles[x][y].id}</td>`
            }
            html += `</tr>`
        }
        html += `</table><br>blank: x: ${this.blank.x}, y: ${this.blank.y}`
        this.divId.innerHTML = html

*/
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

/*

        if (x == this.blank.x){
            if (y == this.blank.y - 1 || y == this.blank.y + 1){
                let elem1 = this.tiles[x][y]
                let blank = this.tiles[this.blank.x][this.blank.y]
                this.tiles[x][y] = blank
                this.tiles[this.blank.x][this.blank.y] = elem1

                this.blank.x = x
                this.blank.y = y
                debugMe("x const", this.blank)
            }
        } else if (y == this.blank.y){
            if (x == this.blank.x - 1 || x == this.blank.x + 1){
                let elem1 = this.tiles[x][y]
                let blank = this.tiles[this.blank.x][this.blank.y]
                this.tiles[x][y] = blank
                this.tiles[this.blank.x][this.blank.y] = elem1

                this.blank.x = x
                this.blank.y = y
                debugMe("y const", this.blank)
            }
        }
        */

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
                }, 50)
            })
        }
    }
}

let slider = null;

async function runMe(n, img, sliderid, msgboxid){
    slider = new Slider(n, img, sliderid, msgboxid)
    await slider.randomize(500)

    /*
    debugMe(slider.czyKoniec())
    slider.rysuj()
    slider.swap(2, 1)
    slider.swap(1, 1)
    slider.rysuj()
    slider.randomize(n**2)
    slider.rysuj()
    */
}
