"use strict";


/* ==================================================
   Broken Throne
   Main Application
================================================== */


/* ==================================================
   STORAGE
================================================== */

const STORAGE_KEY =
    "broken_throne_state";


const DEFAULT_STATE = {

    lastChapter: 1,

    animations: true,

    siteFont: "cairo",

    readerProgress: {},

    reader: {

        fontSize: 1.15,

        lineHeight: 2.1,

        paragraphSpacing: 30,

        width: 78,

        theme: "dark",

        font: "cairo",

        align: "justify"
    }
};


function cloneDefaults(){

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );
}


function loadState(){

    try{

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if(!saved){

            return cloneDefaults();
        }


        const parsed =
            JSON.parse(saved);


        return {

            ...cloneDefaults(),

            ...parsed,

            readerProgress:
                parsed.readerProgress &&
                typeof parsed.readerProgress === "object"
                    ? parsed.readerProgress
                    : {},

            reader: {

                ...cloneDefaults().reader,

                ...(parsed.reader || {})
            }

        };

    }catch(error){

        console.warn(
            "تعذر تحميل الإعدادات:",
            error
        );


        return cloneDefaults();
    }
}


let state =
    loadState();


function saveState(){

    try{

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }catch(error){

        console.warn(
            "تعذر حفظ الإعدادات:",
            error
        );
    }
}


/* ==================================================
   DOM
================================================== */

const splash =
    document.getElementById("splash");

const site =
    document.getElementById("site");

const enterBtn =
    document.getElementById("enterBtn");


const navLinks =
    document.querySelectorAll(".nav-link");

const pages =
    document.querySelectorAll(".page");


const startReading =
    document.getElementById("startReading");

const continueReading =
    document.getElementById("continueReading");

const homeContinueBtn =
    document.getElementById("homeContinueBtn");


const lastReadingTitle =
    document.getElementById("lastReadingTitle");

const lastReadingMeta =
    document.getElementById("lastReadingMeta");


const chaptersList =
    document.getElementById("chaptersList");

const chapterSearch =
    document.getElementById("chapterSearch");

const chapterSearchBtn =
    document.getElementById("chapterSearchBtn");

const chapterCount =
    document.getElementById("chapterCount");

const lastChapterLabel =
    document.getElementById("lastChapterLabel");


const showChapterIndex =
    document.getElementById("showChapterIndex");

const closeChapterIndex =
    document.getElementById("closeChapterIndex");

const chapterIndex =
    document.getElementById("chapterIndex");

const chapterGrid =
    document.getElementById("chapterGrid");


const reader =
    document.getElementById("reader");

const readerTitle =
    document.getElementById("readerTitle");

const readerText =
    document.getElementById("readerText");

const readerChapterNumber =
    document.getElementById("readerChapterNumber");

const readerProgressBar =
    document.getElementById(
        "readerProgressBar"
    );


const backToChapters =
    document.getElementById(
        "backToChapters"
    );

const previousChapter =
    document.getElementById(
        "previousChapter"
    );

const nextChapter =
    document.getElementById(
        "nextChapter"
    );


const readingSettingsBtn =
    document.getElementById(
        "readingSettingsBtn"
    );

const readingSettingsPanel =
    document.getElementById(
        "readingSettingsPanel"
    );

const closeReadingSettings =
    document.getElementById(
        "closeReadingSettings"
    );

const resetReaderSettings =
    document.getElementById(
        "resetReaderSettings"
    );


const animationsToggle =
    document.getElementById(
        "animationsToggle"
    );

const replayIntro =
    document.getElementById(
        "replayIntro"
    );

const resetAllSettings =
    document.getElementById(
        "resetAllSettings"
    );


const siteFontButtons =
    document.querySelectorAll(
        "[data-site-font]"
    );

const readerThemeButtons =
    document.querySelectorAll(
        "[data-reader-theme]"
    );

const readerFontButtons =
    document.querySelectorAll(
        "[data-reader-font]"
    );

const readerAlignButtons =
    document.querySelectorAll(
        "[data-reader-align]"
    );


const fontStepButtons =
    document.querySelectorAll(
        "[data-font-step]"
    );

const lineStepButtons =
    document.querySelectorAll(
        "[data-line-step]"
    );

const paragraphStepButtons =
    document.querySelectorAll(
        "[data-paragraph-step]"
    );

const widthStepButtons =
    document.querySelectorAll(
        "[data-width-step]"
    );


/* ==================================================
   CHAPTER DATA
================================================== */

let chapterIndexData = [];

let currentChapter = null;

let readerSaveTimer = null;


/* ==================================================
   MOTION
================================================== */

function prefersReducedMotion(){

    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


function applyMotion(){

    const disabled =
        !state.animations ||
        prefersReducedMotion();


    document.body.classList.toggle(
        "no-animations",
        disabled
    );


    animationsToggle.checked =
        state.animations;
}


/* ==================================================
   SPLASH
================================================== */

function showSite(){

    splash.classList.add(
        "hidden"
    );

    site.classList.remove(
        "hidden"
    );
}


function enterSite(){

    if(
        state.animations &&
        !prefersReducedMotion()
    ){

        splash.classList.add(
            "fade-out"
        );


        window.setTimeout(
            showSite,
            800
        );

    }else{

        showSite();
    }
}


enterBtn.addEventListener(
    "click",
    enterSite
);


/* ==================================================
   REPLAY SPLASH
================================================== */

replayIntro.addEventListener(
    "click",
    () => {

        closeReader();


        site.classList.add(
            "hidden"
        );


        splash.classList.remove(
            "hidden",
            "fade-out"
        );


        goToPage(
            "home"
        );


        window.scrollTo({

            top: 0,

            behavior: "auto"
        });

    }
);


/* ==================================================
   NAVIGATION
================================================== */

function goToPage(target){

    const targetPage =
        document.getElementById(
            target
        );


    if(!targetPage){

        console.warn(
            "الصفحة غير موجودة:",
            target
        );

        return;
    }


    pages.forEach(
        page => {

            page.classList.toggle(
                "active",
                page.id === target
            );

        }
    );


    navLinks.forEach(
        link => {

            link.classList.toggle(
                "active",
                link.dataset.target === target
            );

        }
    );


    if(target !== "chapters"){

        closeReader();
    }


    window.scrollTo({

        top: 0,

        behavior:
            prefersReducedMotion()
                ? "auto"
                : "smooth"
    });
}


navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                goToPage(
                    link.dataset.target
                );

            }
        );

    }
);


/* ==================================================
   LOAD CHAPTER INDEX
================================================== */

async function loadChapterIndex(){

    try{

        const response =
            await fetch(
                "chapters/index.json",
                {
                    cache: "no-cache"
                }
            );


        if(!response.ok){

            throw new Error(
                "تعذر تحميل فهرس الفصول."
            );
        }


        const data =
            await response.json();


        if(!Array.isArray(data)){

            throw new Error(
                "صيغة فهرس الفصول غير صحيحة."
            );
        }


        chapterIndexData =
            data
                .filter(
                    chapter =>
                        chapter &&
                        Number.isInteger(
                            Number(chapter.number)
                        ) &&
                        chapter.title &&
                        chapter.file
                )
                .sort(
                    (a, b) =>
                        Number(a.number) -
                        Number(b.number)
                );


        chapterCount.textContent =
            `${chapterIndexData.length} فصل`;


        renderChapterList();

        renderChapterGrid();

        updateHomeReadingInfo();

    }catch(error){

        console.error(error);


        chaptersList.innerHTML = `

            <li class="chapter-error">

                تعذر تحميل قائمة الفصول.

            </li>

        `;

        chapterCount.textContent =
            "تعذر تحميل الفصول";
    }
}


/* ==================================================
   FIND CHAPTER
================================================== */

function findChapter(number){

    return chapterIndexData.find(
        chapter =>
            Number(chapter.number) ===
            Number(number)
    );
}


/* ==================================================
   RENDER CHAPTER LIST
================================================== */

function renderChapterList(){

    chaptersList.innerHTML = "";


    chapterIndexData.forEach(
        chapter => {

            const li =
                document.createElement(
                    "li"
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "chapter-item";


            button.dataset.chapter =
                chapter.number;


            const isCurrent =
                Number(chapter.number) ===
                Number(state.lastChapter);


            if(isCurrent){

                button.classList.add(
                    "current"
                );
            }


            const hasProgress =
                Object.prototype.hasOwnProperty.call(
                    state.readerProgress,
                    chapter.number
                );


            const stateText =
                isCurrent
                    ? "آخر فصل تمت زيارته"
                    : hasProgress
                        ? "تمت القراءة جزئيًا"
                        : "فتح الفصل";


            button.innerHTML = `

                <span class="chapter-num">
                    ${String(
                        chapter.number
                    ).padStart(2, "0")}
                </span>


                <span class="chapter-info">

                    <span class="chapter-name">
                        ${escapeHTML(
                            chapter.title
                        )}
                    </span>


                    <span class="chapter-state">
                        ${stateText}
                    </span>

                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openChapter(
                        Number(
                            chapter.number
                        )
                    );

                }
            );


            li.appendChild(
                button
            );


            chaptersList.appendChild(
                li
            );

        }
    );
}


/* ==================================================
   RENDER CHAPTER GRID
================================================== */

function renderChapterGrid(){

    chapterGrid.innerHTML = "";


    chapterIndexData.forEach(
        chapter => {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";


            button.textContent =
                String(
                    chapter.number
                ).padStart(
                    2,
                    "0"
                );


            if(
                Number(chapter.number) ===
                Number(state.lastChapter)
            ){

                button.classList.add(
                    "current"
                );
            }


            button.title =
                chapter.title;


            button.addEventListener(
                "click",
                () => {

                    openChapter(
                        Number(
                            chapter.number
                        )
                    );


                    chapterIndex.classList.add(
                        "hidden"
                    );

                }
            );


            chapterGrid.appendChild(
                button
            );

        }
    );
}


/* ==================================================
   OPEN CHAPTER
================================================== */

async function openChapter(number){

    const chapter =
        findChapter(number);


    if(!chapter){

        alert(
            "هذا الفصل غير موجود."
        );

        return;
    }


    currentChapter =
        Number(
            chapter.number
        );


    state.lastChapter =
        currentChapter;


    saveState();


    chaptersList.classList.add(
        "hidden"
    );


    chapterIndex.classList.add(
        "hidden"
    );


    reader.classList.remove(
        "hidden"
    );


    readingSettingsPanel.classList.add(
        "hidden"
    );


    readerTitle.textContent =
        chapter.title;


    readerChapterNumber.textContent =
        `الفصل ${
            String(
                currentChapter
            ).padStart(
                2,
                "0"
            )
        }`;


    readerText.innerHTML = `

        <p>
            جاري تحميل الفصل...
        </p>

    `;


    updateChapterNavigation();


    renderChapterList();

    renderChapterGrid();


    await loadChapterFile(
        chapter.file
    );


    applyReaderSettings();


    restoreReaderProgress();

}


/* ==================================================
   LOAD CHAPTER FILE
================================================== */

async function loadChapterFile(file){

    try{

        const response =
            await fetch(
                `chapters/${file}`,
                {
                    cache: "no-cache"
                }
            );


        if(!response.ok){

            throw new Error(
                `تعذر تحميل الفصل: ${file}`
            );
        }


        const html =
            await response.text();


        readerText.innerHTML =
            html;


    }catch(error){

        console.error(
            error
        );


        readerText.innerHTML = `

            <p>
                تعذر تحميل محتوى هذا الفصل.
            </p>

        `;
    }
}


/* ==================================================
   CLOSE READER
================================================== */

function closeReader(){

    saveReaderProgress();


    reader.classList.add(
        "hidden"
    );


    chaptersList.classList.remove(
        "hidden"
    );


    readingSettingsPanel.classList.add(
        "hidden"
    );


    chapterIndex.classList.add(
        "hidden"
    );


    currentChapter = null;


    readerProgressBar.style.width =
        "0%";
}


backToChapters.addEventListener(
    "click",
    () => {

        closeReader();


        window.scrollTo({

            top: 0,

            behavior:
                prefersReducedMotion()
                    ? "auto"
                    : "smooth"
        });

    }
);


/* ==================================================
   CHAPTER NAVIGATION
================================================== */

function updateChapterNavigation(){

    const index =
        chapterIndexData.findIndex(
            chapter =>
                Number(chapter.number) ===
                Number(currentChapter)
        );


    const hasPrevious =
        index > 0;


    const hasNext =
        index >= 0 &&
        index <
        chapterIndexData.length - 1;


    previousChapter.disabled =
        !hasPrevious;


    nextChapter.disabled =
        !hasNext;
}


previousChapter.addEventListener(
    "click",
    () => {

        if(currentChapter === null){
            return;
        }


        saveReaderProgress();


        const index =
            chapterIndexData.findIndex(
                chapter =>
                    Number(chapter.number) ===
                    Number(currentChapter)
            );


        if(index > 0){

            openChapter(
                Number(
                    chapterIndexData[
                        index - 1
                    ].number
                )
            );

        }

    }
);


nextChapter.addEventListener(
    "click",
    () => {

        if(currentChapter === null){
            return;
        }


        saveReaderProgress();


        const index =
            chapterIndexData.findIndex(
                chapter =>
                    Number(chapter.number) ===
                    Number(currentChapter)
            );


        if(
            index >= 0 &&
            index <
            chapterIndexData.length - 1
        ){

            openChapter(
                Number(
                    chapterIndexData[
                        index + 1
                    ].number
                )
            );

        }

    }
);


/* ==================================================
   SEARCH
================================================== */

function searchChapter(){

    const query =
        chapterSearch.value
            .trim()
            .toLowerCase();


    if(!query){

        chapterSearch.focus();

        return;
    }


    const numericQuery =
        Number(query);


    let chapter = null;


    if(
        Number.isInteger(
            numericQuery
        ) &&
        numericQuery > 0
    ){

        chapter =
            findChapter(
                numericQuery
            );
    }


    if(!chapter){

        chapter =
            chapterIndexData.find(
                item =>
                    String(
                        item.title
                    )
                    .toLowerCase()
                    .includes(query)
            );
    }


    if(!chapter){

        alert(
            "لم يتم العثور على الفصل."
        );

        return;
    }


    chapterSearch.value = "";


    openChapter(
        Number(chapter.number)
    );
}


chapterSearchBtn.addEventListener(
    "click",
    searchChapter
);


chapterSearch.addEventListener(
    "keydown",
    event => {

        if(event.key === "Enter"){

            searchChapter();
        }

    }
);


/* ==================================================
   CHAPTER INDEX
================================================== */

showChapterIndex.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        chapterIndex.classList.toggle(
            "hidden"
        );

    }
);


closeChapterIndex.addEventListener(
    "click",
    () => {

        chapterIndex.classList.add(
            "hidden"
        );

    }
);


/* ==================================================
   HOME READING INFO
================================================== */

function updateHomeReadingInfo(){

    if(
        !state.lastChapter ||
        !chapterIndexData.length
    ){

        lastReadingTitle.textContent =
            "لم تبدأ القراءة بعد";


        lastReadingMeta.textContent =
            "ابدأ الرواية من الفصل الأول";


        lastChapterLabel.textContent =
            "آخر قراءة: —";


        return;
    }


    const chapter =
        findChapter(
            Number(
                state.lastChapter
            )
        );


    if(!chapter){

        lastReadingTitle.textContent =
            "لم تبدأ القراءة بعد";


        lastReadingMeta.textContent =
            "ابدأ الرواية من الفصل الأول";


        lastChapterLabel.textContent =
            "آخر قراءة: —";


        return;
    }


    lastReadingTitle.textContent =
        chapter.title;


    lastReadingMeta.textContent =
        `الفصل ${
            String(
                chapter.number
            ).padStart(
                2,
                "0"
            )
        }`;


    lastChapterLabel.textContent =
        `آخر قراءة: الفصل ${
            String(
                chapter.number
            ).padStart(
                2,
                "0"
            )
        }`;
}


/* ==================================================
   HOME BUTTONS
================================================== */

startReading.addEventListener(
    "click",
    () => {

        goToPage(
            "chapters"
        );


        if(chapterIndexData.length){

            openChapter(
                Number(
                    chapterIndexData[0].number
                )
            );

        }

    }
);


continueReading.addEventListener(
    "click",
    () => {

        goToPage(
            "chapters"
        );


        const chapter =
            findChapter(
                Number(
                    state.lastChapter
                )
            );


        if(chapter){

            openChapter(
                Number(
                    chapter.number
                )
            );

        }else if(chapterIndexData.length){

            openChapter(
                Number(
                    chapterIndexData[0].number
                )
            );
        }

    }
);


homeContinueBtn.addEventListener(
    "click",
    () => {

        goToPage(
            "chapters"
        );


        const chapter =
            findChapter(
                Number(
                    state.lastChapter
                )
            );


        if(chapter){

            openChapter(
                Number(
                    chapter.number
                )
            );

        }else if(chapterIndexData.length){

            openChapter(
                Number(
                    chapterIndexData[0].number
                )
            );

        }

    }
);


/* ==================================================
   READING SETTINGS PANEL
================================================== */

readingSettingsBtn.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        readingSettingsPanel.classList.toggle(
            "hidden"
        );

    }
);


closeReadingSettings.addEventListener(
    "click",
    () => {

        readingSettingsPanel.classList.add(
            "hidden"
        );

    }
);


/* ==================================================
   READER SETTINGS
================================================== */

function applyReaderSettings(){

    document.documentElement.style.setProperty(
        "--reader-size",
        `${state.reader.fontSize}rem`
    );


    document.documentElement.style.setProperty(
        "--reader-line",
        state.reader.lineHeight
    );


    document.documentElement.style.setProperty(
        "--reader-paragraph",
        `${state.reader.paragraphSpacing}px`
    );


    document.documentElement.style.setProperty(
        "--reader-width",
        `${state.reader.width}ch`
    );


    document.documentElement.style.setProperty(
        "--reader-align",
        state.reader.align
    );


    readerText.classList.remove(
        "theme-dark",
        "theme-sepia",
        "theme-light"
    );


    readerText.classList.add(
        `theme-${state.reader.theme}`
    );


    readerText.classList.remove(
        "font-cairo",
        "font-ruqaa"
    );


    readerText.classList.add(
        `font-${state.reader.font}`
    );


    readerThemeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.readerTheme ===
                state.reader.theme
            );

        }
    );


    readerFontButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.readerFont ===
                state.reader.font
            );

        }
    );


    readerAlignButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.readerAlign ===
                state.reader.align
            );

        }
    );
}


/* ==================================================
   FONT SIZE
================================================== */

fontStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(
                        button.dataset.fontStep
                    );


                state.reader.fontSize =
                    Math.min(
                        1.8,
                        Math.max(
                            0.85,
                            Number(
                                (
                                    state.reader.fontSize +
                                    step * 0.1
                                ).toFixed(2)
                            )
                        )
                    );


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   LINE HEIGHT
================================================== */

lineStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(
                        button.dataset.lineStep
                    );


                state.reader.lineHeight =
                    Math.min(
                        3.2,
                        Math.max(
                            1.4,
                            Number(
                                (
                                    state.reader.lineHeight +
                                    step * 0.15
                                ).toFixed(2)
                            )
                        )
                    );


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   PARAGRAPH SPACING
================================================== */

paragraphStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(
                        button.dataset.paragraphStep
                    );


                state.reader.paragraphSpacing =
                    Math.min(
                        60,
                        Math.max(
                            10,
                            state.reader.paragraphSpacing +
                            step * 5
                        )
                    );


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   READER WIDTH
================================================== */

widthStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(
                        button.dataset.widthStep
                    );


                state.reader.width =
                    Math.min(
                        95,
                        Math.max(
                            55,
                            state.reader.width +
                            step * 5
                        )
                    );


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   READER THEME
================================================== */

readerThemeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.reader.theme =
                    button.dataset.readerTheme;


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   READER FONT
================================================== */

readerFontButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.reader.font =
                    button.dataset.readerFont;


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   READER ALIGNMENT
================================================== */

readerAlignButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.reader.align =
                    button.dataset.readerAlign;


                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   RESET READER SETTINGS
================================================== */

resetReaderSettings.addEventListener(
    "click",
    () => {

        state.reader =
            cloneDefaults().reader;


        saveState();

        applyReaderSettings();

    }
);


/* ==================================================
   SITE FONT
================================================== */

function applySiteFont(){

    const fonts = {

        cairo:
            '"Cairo", sans-serif',

        tajawal:
            '"Tajawal", sans-serif',

        kufi:
            '"Noto Kufi Arabic", sans-serif'
    };


    document.body.style.fontFamily =
        fonts[state.siteFont] ||
        fonts.cairo;


    siteFontButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.siteFont ===
                state.siteFont
            );

        }
    );
}


siteFontButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.siteFont =
                    button.dataset.siteFont;


                saveState();

                applySiteFont();

            }
        );

    }
);


/* ==================================================
   ANIMATIONS
================================================== */

animationsToggle.addEventListener(
    "change",
    () => {

        state.animations =
            animationsToggle.checked;


        saveState();

        applyMotion();

    }
);


/* ==================================================
   READER PROGRESS
================================================== */

function calculateReaderProgress(){

    if(
        currentChapter === null ||
        reader.classList.contains("hidden")
    ){

        return 0;
    }


    const readerTop =
        readerText.offsetTop;


    const readerHeight =
        readerText.offsetHeight;


    const viewportHeight =
        window.innerHeight;


    const available =
        Math.max(
            1,
            readerHeight -
            viewportHeight
        );


    const current =
        Math.max(
            0,
            window.scrollY -
            readerTop
        );


    return Math.min(
        1,
        Math.max(
            0,
            current / available
        )
    );
}


function updateReaderProgress(){

    if(
        currentChapter === null ||
        reader.classList.contains("hidden")
    ){

        readerProgressBar.style.width =
            "0%";

        return;
    }


    const progress =
        calculateReaderProgress();


    readerProgressBar.style.width =
        `${progress * 100}%`;


    saveReaderProgress();
}


function saveReaderProgress(){

    if(
        currentChapter === null ||
        reader.classList.contains("hidden")
    ){

        return;
    }


    const progress =
        calculateReaderProgress();


    state.readerProgress[
        currentChapter
    ] = progress;


    clearTimeout(
        readerSaveTimer
    );


    readerSaveTimer =
        window.setTimeout(
            saveState,
            300
        );
}


function restoreReaderProgress(){

    if(currentChapter === null){

        return;
    }


    const progress =
        Number(
            state.readerProgress[
                currentChapter
            ]
        );


    if(
        !Number.isFinite(progress) ||
        progress <= 0
    ){

        window.scrollTo({

            top: 0,

            behavior: "auto"
        });


        readerProgressBar.style.width =
            "0%";

        return;
    }


    window.requestAnimationFrame(
        () => {

            const readerTop =
                readerText.offsetTop;


            const available =
                Math.max(
                    0,
                    readerText.offsetHeight -
                    window.innerHeight
                );


            if(available <= 0){

                window.scrollTo({

                    top: 0,

                    behavior: "auto"
                });

                return;
            }


            window.scrollTo({

                top:
                    readerTop +
                    available *
                    Math.min(
                        1,
                        Math.max(
                            0,
                            progress
                        )
                    ),

                behavior: "auto"
            });


            readerProgressBar.style.width =
                `${progress * 100}%`;
        }
    );
}


window.addEventListener(
    "scroll",
    updateReaderProgress,
    {
        passive: true
    }
);


window.addEventListener(
    "beforeunload",
    saveReaderProgress
);


/* ==================================================
   RESET ALL SETTINGS
================================================== */

resetAllSettings.addEventListener(
    "click",
    () => {

        const confirmed =
            window.confirm(
                "هل تريد إعادة جميع إعدادات الموقع والقراءة؟"
            );


        if(!confirmed){
            return;
        }


        const preservedChapter =
            state.lastChapter;


        state =
            cloneDefaults();


        state.lastChapter =
            preservedChapter;


        saveState();


        animationsToggle.checked =
            state.animations;


        applyMotion();

        applySiteFont();

        applyReaderSettings();

        renderChapterList();

        renderChapterGrid();

        updateHomeReadingInfo();

    }
);


/* ==================================================
   ESCAPE
================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(event.key !== "Escape"){
            return;
        }


        readingSettingsPanel.classList.add(
            "hidden"
        );


        chapterIndex.classList.add(
            "hidden"
        );

    }
);


/* ==================================================
   HTML ESCAPE
================================================== */

function escapeHTML(value){

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* ==================================================
   INITIALIZE
================================================== */

async function initialize(){


    /*
       الدخولية تظهر عند كل فتح للموقع.
    */

    splash.classList.remove(
        "hidden"
    );


    site.classList.add(
        "hidden"
    );


    animationsToggle.checked =
        state.animations;


    applyMotion();

    applySiteFont();

    applyReaderSettings();


    await loadChapterIndex();


    goToPage(
        "home"
    );
}


initialize();
