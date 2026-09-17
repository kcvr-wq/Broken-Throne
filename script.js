"use strict";


/* ==================================================
   BROKEN THRONE
   APPLICATION
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

    uiDensity: "normal",

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
            "تعذر تحميل إعدادات الموقع:",
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
            "تعذر حفظ إعدادات الموقع:",
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

const readerChapterNumberBottom =
    document.getElementById(
        "readerChapterNumberBottom"
    );

const readerProgressBar =
    document.getElementById(
        "readerProgressBar"
    );

const readerProgressLabel =
    document.getElementById(
        "readerProgressLabel"
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

const uiDensityButtons =
    document.querySelectorAll(
        "[data-ui-density]"
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
   CHAPTER STATE
================================================== */

let chapterIndexData = [];

let currentChapter = null;

let progressSaveTimer = null;


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
   UI DENSITY
================================================== */

function applyUIDensity(){

    document.body.classList.remove(
        "ui-compact",
        "ui-normal",
        "ui-relaxed"
    );


    document.body.classList.add(
        `ui-${state.uiDensity}`
    );


    uiDensityButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.uiDensity ===
                state.uiDensity
            );
        }
    );
}


uiDensityButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                state.uiDensity =
                    button.dataset.uiDensity;


                saveState();

                applyUIDensity();
            }
        );

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
   CHAPTER INDEX
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
                "فهرس الفصول غير صحيح."
            );
        }


        chapterIndexData =
            data
                .filter(
                    chapter =>

                        chapter &&

                        Number.isInteger(
                            Number(
                                chapter.number
                            )
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
            chapterIndexData.length;


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
   GET CHAPTER PROGRESS
================================================== */

function getChapterProgress(number){

    const value =
        Number(
            state.readerProgress[
                number
            ]
        );


    if(!Number.isFinite(value)){
        return 0;
    }


    return Math.min(
        1,
        Math.max(
            0,
            value
        )
    );
}


/* ==================================================
   CHAPTER STATUS
================================================== */

function getChapterStateText(chapter){

    const number =
        Number(
            chapter.number
        );


    const progress =
        getChapterProgress(
            number
        );


    if(
        number ===
        Number(
            state.lastChapter
        )
    ){

        if(progress >= 0.95){

            return "آخر فصل — مكتمل تقريبًا";
        }


        return "آخر فصل تمت قراءته";
    }


    if(progress > 0){

        return "تمت القراءة جزئيًا";
    }


    return "فتح الفصل";
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


            button.type =
                "button";


            button.className =
                "chapter-item";


            button.dataset.chapter =
                chapter.number;


            const number =
                Number(
                    chapter.number
                );


            const isCurrent =
                number ===
                Number(
                    state.lastChapter
                );


            if(isCurrent){

                button.classList.add(
                    "current"
                );
            }


            const progress =
                getChapterProgress(
                    number
                );


            button.innerHTML = `

                <span class="chapter-num">
                    ${String(
                        number
                    ).padStart(
                        2,
                        "0"
                    )}
                </span>


                <span class="chapter-info">

                    <span class="chapter-name">
                        ${escapeHTML(
                            chapter.title
                        )}
                    </span>

                    <span class="chapter-state">
                        ${getChapterStateText(
                            chapter
                        )}
                    </span>

                </span>


                <span class="chapter-progress">

                    <span class="chapter-progress-bar">

                        <span
                            style="width:${progress * 100}%"
                        ></span>

                    </span>

                    <span class="chapter-progress-label">
                        ${Math.round(
                            progress * 100
                        )}%
                    </span>

                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    openChapter(
                        number
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
   RENDER INDEX GRID
================================================== */

function renderChapterGrid(){

    chapterGrid.innerHTML = "";


    chapterIndexData.forEach(
        chapter => {

            const number =
                Number(
                    chapter.number
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                String(
                    number
                ).padStart(
                    2,
                    "0"
                );


            button.title =
                chapter.title;


            if(
                number ===
                Number(
                    state.lastChapter
                )
            ){

                button.classList.add(
                    "current"
                );
            }


            button.addEventListener(
                "click",
                () => {

                    openChapter(
                        number
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
   HOME READING INFO
================================================== */

function updateHomeReadingInfo(){

    if(!chapterIndexData.length){

        lastReadingTitle.textContent =
            "لا توجد فصول";

        lastReadingMeta.textContent =
            "أضف الفصول إلى الفهرس أولًا";

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


    const progress =
        getChapterProgress(
            chapter.number
        );


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
        } · ${
            Math.round(
                progress * 100
            )
        }%`;


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
   OPEN CHAPTER
================================================== */

async function openChapter(number){

    const chapter =
        findChapter(
            number
        );


    if(!chapter){

        alert(
            "هذا الفصل غير موجود."
        );

        return;
    }


    saveReaderProgress();


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


    readerChapterNumberBottom.textContent =
        String(
            currentChapter
        ).padStart(
            2,
            "0"
        );


    readerText.innerHTML = `

        <p>
            جاري تحميل الفصل...
        </p>

    `;


    readerProgressBar.style.width =
        "0%";


    readerProgressLabel.textContent =
        "0%";


    updateChapterNavigation();


    await loadChapterFile(
        chapter.file
    );


    applyReaderSettings();


    renderChapterList();

    renderChapterGrid();

    updateHomeReadingInfo();


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

        console.error(error);


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


    currentChapter =
        null;


    readerProgressBar.style.width =
        "0%";


    readerProgressLabel.textContent =
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
                Number(
                    chapter.number
                ) ===
                Number(
                    currentChapter
                )
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

        if(
            currentChapter === null
        ){
            return;
        }


        saveReaderProgress();


        const index =
            chapterIndexData.findIndex(
                chapter =>
                    Number(
                        chapter.number
                    ) ===
                    Number(
                        currentChapter
                    )
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

        if(
            currentChapter === null
        ){
            return;
        }


        saveReaderProgress();


        const index =
            chapterIndexData.findIndex(
                chapter =>
                    Number(
                        chapter.number
                    ) ===
                    Number(
                        currentChapter
                    )
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


    let chapter = null;


    const numericQuery =
        Number(
            query
        );


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
                    .includes(
                        query
                    )
            );
    }


    if(!chapter){

        alert(
            "لم يتم العثور على الفصل."
        );

        return;
    }


    chapterSearch.value =
        "";


    openChapter(
        Number(
            chapter.number
        )
    );
}


chapterSearchBtn.addEventListener(
    "click",
    searchChapter
);


chapterSearch.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Enter"
        ){

            searchChapter();
        }

    }
);


/* ==================================================
   CHAPTER INDEX PANEL
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
   HOME BUTTONS
================================================== */

startReading.addEventListener(
    "click",
    () => {

        goToPage(
            "chapters"
        );


        if(
            chapterIndexData.length
        ){

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


        const savedChapter =
            findChapter(
                Number(
                    state.lastChapter
                )
            );


        if(savedChapter){

            openChapter(
                Number(
                    savedChapter.number
                )
            );

        }else if(
            chapterIndexData.length
        ){

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


        const savedChapter =
            findChapter(
                Number(
                    state.lastChapter
                )
            );


        if(savedChapter){

            openChapter(
                Number(
                    savedChapter.number
                )
            );

        }else if(
            chapterIndexData.length
        ){

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
   CLOSE PANELS OUTSIDE
================================================== */

document.addEventListener(
    "click",
    event => {

        if(
            !readingSettingsPanel.classList.contains(
                "hidden"
            ) &&
            !readingSettingsPanel.contains(
                event.target
            ) &&
            event.target !==
                readingSettingsBtn
        ){

            readingSettingsPanel.classList.add(
                "hidden"
            );
        }


        if(
            !chapterIndex.classList.contains(
                "hidden"
            ) &&
            !chapterIndex.contains(
                event.target
            ) &&
            event.target !==
                showChapterIndex
        ){

            chapterIndex.classList.add(
                "hidden"
            );
        }

    }
);


/* ==================================================
   APPLY READER SETTINGS
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
   READER PROGRESS
================================================== */

function calculateReaderProgress(){

    if(
        currentChapter === null ||
        reader.classList.contains(
            "hidden"
        )
    ){

        return 0;
    }


    const readerTop =
        readerText.getBoundingClientRect().top +
        window.scrollY;


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
        reader.classList.contains(
            "hidden"
        )
    ){

        return;
    }


    const progress =
        calculateReaderProgress();


    const percent =
        Math.round(
            progress * 100
        );


    readerProgressBar.style.width =
        `${percent}%`;


    readerProgressLabel.textContent =
        `${percent}%`;


    scheduleProgressSave();
}


function scheduleProgressSave(){

    if(currentChapter === null){
        return;
    }


    clearTimeout(
        progressSaveTimer
    );


    progressSaveTimer =
        window.setTimeout(
            () => {

                state.readerProgress[
                    currentChapter
                ] =
                    calculateReaderProgress();


                saveState();

                renderChapterList();

                renderChapterGrid();

                updateHomeReadingInfo();

            },
            350
        );
}


function saveReaderProgress(){

    if(
        currentChapter === null ||
        reader.classList.contains(
            "hidden"
        )
    ){

        return;
    }


    clearTimeout(
        progressSaveTimer
    );


    state.readerProgress[
        currentChapter
    ] =
        calculateReaderProgress();


    saveState();
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
        !Number.isFinite(
            progress
        ) ||
        progress <= 0
    ){

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });


        readerProgressBar.style.width =
            "0%";


        readerProgressLabel.textContent =
            "0%";


        return;
    }


    window.requestAnimationFrame(
        () => {

            const readerTop =
                readerText.getBoundingClientRect().top +
                window.scrollY;


            const available =
                Math.max(
                    0,
                    readerText.offsetHeight -
                    window.innerHeight
                );


            if(available <= 0){
                return;
            }


            const safeProgress =
                Math.min(
                    1,
                    Math.max(
                        0,
                        progress
                    )
                );


            window.scrollTo({

                top:
                    readerTop +
                    available *
                    safeProgress,

                behavior: "auto"
            });


            readerProgressBar.style.width =
                `${safeProgress * 100}%`;


            readerProgressLabel.textContent =
                `${Math.round(
                    safeProgress * 100
                )}%`;

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
   RESET EVERYTHING
================================================== */

resetAllSettings.addEventListener(
    "click",
    () => {

        const confirmed =
            window.confirm(
                "هل تريد إعادة إعدادات الموقع والقارئ؟"
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


        applyMotion();

        applyUIDensity();

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

        if(
            event.key !==
            "Escape"
        ){

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
       الدخولية تظهر دائمًا عند فتح الموقع.
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

    applyUIDensity();

    applySiteFont();

    applyReaderSettings();


    await loadChapterIndex();


    goToPage(
        "home"
    );
}


initialize();
