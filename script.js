"use strict";


/* ==================================================
   Broken Throne
   Main Application
================================================== */


/* ==================================================
   STORAGE
================================================== */

const STORAGE_KEY = "broken_throne_state";

const DEFAULT_STATE = {

    lastChapter: 1,

    animations: true,

    siteFont: "cairo",

    reader: {

        fontSize: 1.15,
        lineHeight: 2.1,
        paragraphSpacing: 30,
        width: 78,

        theme: "dark",
        font: "cairo"
    }
};


function cloneDefaults(){

    return JSON.parse(
        JSON.stringify(DEFAULT_STATE)
    );
}


function loadState(){

    try{

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if(!saved){

            return cloneDefaults();
        }

        const parsed =
            JSON.parse(saved);

        return {

            ...cloneDefaults(),

            ...parsed,

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


let state = loadState();


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


const chaptersList =
    document.getElementById("chaptersList");

const chapterSearch =
    document.getElementById("chapterSearch");

const chapterSearchBtn =
    document.getElementById("chapterSearchBtn");


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
    document.getElementById("readerProgressBar");


const backToChapters =
    document.getElementById("backToChapters");

const previousChapter =
    document.getElementById("previousChapter");

const nextChapter =
    document.getElementById("nextChapter");


const readingSettingsBtn =
    document.getElementById("readingSettingsBtn");

const readingSettingsPanel =
    document.getElementById("readingSettingsPanel");

const closeReadingSettings =
    document.getElementById("closeReadingSettings");

const resetReaderSettings =
    document.getElementById("resetReaderSettings");


const animationsToggle =
    document.getElementById("animationsToggle");

const replayIntro =
    document.getElementById("replayIntro");

const resetAllSettings =
    document.getElementById("resetAllSettings");


const siteFontButtons =
    document.querySelectorAll("[data-site-font]");

const readerThemeButtons =
    document.querySelectorAll("[data-reader-theme]");

const readerFontButtons =
    document.querySelectorAll("[data-reader-font]");


const fontStepButtons =
    document.querySelectorAll("[data-font-step]");

const lineStepButtons =
    document.querySelectorAll("[data-line-step]");

const paragraphStepButtons =
    document.querySelectorAll("[data-paragraph-step]");

const widthStepButtons =
    document.querySelectorAll("[data-width-step]");


/* ==================================================
   CHAPTER DATA
================================================== */

let chapterIndexData = [];

let currentChapter = null;


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

/*
   الدخولية لا يتم حفظ حالتها.
   لذلك تظهر عند كل تحميل للموقع.
*/

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

        setTimeout(
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

        site.classList.add(
            "hidden"
        );

        splash.classList.remove(
            "hidden",
            "fade-out"
        );

        goToPage("home");

        closeReader();

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
        document.getElementById(target);

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


        chapterIndexData =
            await response.json();


        if(!Array.isArray(chapterIndexData)){

            throw new Error(
                "صيغة فهرس الفصول غير صحيحة."
            );
        }


        chapterIndexData.sort(
            (a, b) =>
                Number(a.number) -
                Number(b.number)
        );


        renderChapterList();

        renderChapterGrid();


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
   RENDER CHAPTER LIST
================================================== */

function renderChapterList(){

    chaptersList.innerHTML = "";


    chapterIndexData.forEach(
        chapter => {

            const li =
                document.createElement("li");


            const button =
                document.createElement("button");


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


            const stateText =
                isCurrent
                    ? "آخر فصل تمت قراءته"
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


            li.appendChild(button);

            chaptersList.appendChild(li);

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
                document.createElement("button");


            button.type = "button";


            button.textContent =
                String(
                    chapter.number
                ).padStart(2, "0");


            const isCurrent =
                Number(chapter.number) ===
                Number(state.lastChapter);


            if(isCurrent){

                button.classList.add(
                    "current"
                );

            }


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
        Number(chapter.number);


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
            ).padStart(2, "0")
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


    resetReaderProgress();


    window.scrollTo({

        top: 0,

        behavior:
            prefersReducedMotion()
                ? "auto"
                : "smooth"
    });
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

    const currentIndex =
        chapterIndexData.findIndex(
            chapter =>
                Number(chapter.number) ===
                Number(currentChapter)
        );


    const hasPrevious =
        currentIndex > 0;


    const hasNext =
        currentIndex >= 0 &&
        currentIndex <
        chapterIndexData.length - 1;


    previousChapter.disabled =
        !hasPrevious;


    nextChapter.disabled =
        !hasNext;


    previousChapter.style.opacity =
        hasPrevious
            ? "1"
            : "0.4";


    nextChapter.style.opacity =
        hasNext
            ? "1"
            : "0.4";
}


previousChapter.addEventListener(
    "click",
    () => {

        if(currentChapter === null){
            return;
        }


        const currentIndex =
            chapterIndexData.findIndex(
                chapter =>
                    Number(chapter.number) ===
                    Number(currentChapter)
            );


        if(currentIndex > 0){

            openChapter(
                Number(
                    chapterIndexData[
                        currentIndex - 1
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


        const currentIndex =
            chapterIndexData.findIndex(
                chapter =>
                    Number(chapter.number) ===
                    Number(currentChapter)
            );


        if(
            currentIndex >= 0 &&
            currentIndex <
            chapterIndexData.length - 1
        ){

            openChapter(
                Number(
                    chapterIndexData[
                        currentIndex + 1
                    ].number
                )
            );

        }

    }
);


/* ==================================================
   CHAPTER SEARCH
================================================== */

function searchChapter(){

    const value =
        chapterSearch.value.trim();


    if(!value){

        chapterSearch.focus();

        return;
    }


    const number =
        Number(value);


    if(
        !Number.isInteger(number) ||
        number < 1
    ){

        alert(
            "اكتب رقم فصل صحيح."
        );

        return;
    }


    const chapter =
        findChapter(number);


    if(!chapter){

        alert(
            `الفصل ${number} غير موجود.`
        );

        return;
    }


    openChapter(number);


    chapterSearch.value = "";
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
    () => {

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
   HOME
================================================== */

startReading.addEventListener(
    "click",
    () => {

        goToPage("chapters");


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

        goToPage("chapters");


        if(chapterIndexData.length){

            const savedChapter =
                findChapter(
                    Number(
                        state.lastChapter
                    )
                );


            openChapter(
                savedChapter
                    ? Number(savedChapter.number)
                    : Number(
                        chapterIndexData[0].number
                    )
            );

        }

    }
);


/* ==================================================
   READER SETTINGS PANEL
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
            !readingSettingsPanel.contains(event.target) &&
            event.target !== readingSettingsBtn
        ){

            readingSettingsPanel.classList.add(
                "hidden"
            );
        }


        if(
            !chapterIndex.classList.contains(
                "hidden"
            ) &&
            !chapterIndex.contains(event.target) &&
            event.target !== showChapterIndex
        ){

            chapterIndex.classList.add(
                "hidden"
            );
        }

    }
);


/* ==================================================
   READER FONT SIZE
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
   READER LINE HEIGHT
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

}


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
   RESET ALL
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


        const currentChapterSaved =
            state.lastChapter;


        state =
            cloneDefaults();


        /*
           نحتفظ بآخر فصل.
           إعادة الإعدادات لا يجب أن ترجع
           المستخدم للفصل الأول.
        */

        state.lastChapter =
            currentChapterSaved;


        saveState();


        applyMotion();

        applySiteFont();

        applyReaderSettings();


        renderChapterList();

        renderChapterGrid();

    }
);


/* ==================================================
   READER PROGRESS
================================================== */

function updateReaderProgress(){

    if(
        reader.classList.contains(
            "hidden"
        )
    ){

        readerProgressBar.style.width =
            "0%";

        return;
    }


    const readerTop =
        readerText.getBoundingClientRect().top +
        window.scrollY;


    const readerHeight =
        readerText.offsetHeight;


    const viewportHeight =
        window.innerHeight;


    const total =
        readerTop +
        readerHeight -
        viewportHeight;


    const current =
        window.scrollY;


    let percent = 0;


    if(total > 0){

        percent =
            ((current - readerTop) /
            (readerHeight - viewportHeight)) *
            100;

    }


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    readerProgressBar.style.width =
        `${percent}%`;
}


window.addEventListener(
    "scroll",
    updateReaderProgress,
    {
        passive: true
    }
);


/* ==================================================
   RESET READER PROGRESS
================================================== */

function resetReaderProgress(){

    readerProgressBar.style.width =
        "0%";
}


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

    applySiteFont();

    applyReaderSettings();


    await loadChapterIndex();


    goToPage("home");
}


initialize();
