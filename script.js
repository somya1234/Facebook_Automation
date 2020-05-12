let fs = require("fs");
let puppeteer = require("puppeteer");
let cFile = process.argv[2];
let pageName = process.argv[3];
let numberOfLikes = process.argv[4];

(async function(){
    try{
    let browser = await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args:["--start-maximized","--disable-notifications"]
    });
    let data = await fs.promises.readFile(cFile);
    let {user,pwd} = JSON.parse(data);
    let pages =await browser.pages();
    let page = pages[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://www.facebook.com",{waitUntil:"networkidle2"});
    /*******************************Login *************************************** */
    await page.waitForSelector("#email",{visible:true,timeout:0});
    await page.type("#email",user);
    await page.type("#pass",pwd);
    await Promise.all([
        page.click("#loginbutton"), page.waitForNavigation({waitUntil:"networkidle2"})
    ]);
    /**********************SEARCH THE PAGE ******************************************* */
    await page.waitForSelector("input[placeholder=Search]",{visible:true,timeout:0});
    await page.type("input[placeholder=Search]",pageName);
    await Promise.all([
        await page.keyboard.press("Enter"),
        await page.waitForNavigation({waitUntil:"networkidle2"})
    ]);
    /************************click on first page ***************************************** */
    await page.waitForSelector("._6v_0._4ik4._4ik5",{visible:true});
    await Promise.all([
        await page.click("._6v_0._4ik4._4ik5 a"),
        await page.waitForNavigation({waitUntil:"networkidle2"})
    ]);
    /*************************click on posts ********************************************** */
    await page.waitForSelector("div[data-key=tab_posts]",{visible:true,timeout:0});
    await Promise.all([
        await page.click("div[data-key=tab_posts]"),
        await page.waitForNavigation({waitUntil:"networkidle2"})
    ]);
    /*************************go tp posts to like************************************** */
    let idx = 0;
    while(idx<numberOfLikes){
        await page.waitForSelector("#pagelet_timeline_main_column .clearfix.uiMorePager",{visible:true,timeout:0});
        //using immediate child operator 
        let elements = await page.$$("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8");
        let post = elements[idx];
        await page.waitForSelector("._666k",{timeouut:0,visible:true})
        let like = await post.$("._666k");
        await like.click();
        idx++;
        if(idx%7==0 || idx%7==1){
            await page.waitForSelector(".uiMorePagerLoader",{hidden:true,timeout:0});
            await page.waitForSelector("#pagelet_timeline_main_column .clearfix.uiMorePager",{visible:true,timeout:0});
            await page.evaluate(function(){
                document.querySelector("#pagelet_timeline_main_column .clearfix.uiMorePager")
                .scrollIntoView();
            })
        }
        console.log("index"+idx);
    }
    console.log("connection made successfully");   
    }
    catch(er){
        console.log(er);
    }
})()