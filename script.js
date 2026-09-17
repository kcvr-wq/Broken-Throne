/* ==================================================
   Broken Throne
   Main Application
================================================== */

"use strict";


/* ==================================================
   العناصر الأساسية
================================================== */

const splash = document.getElementById("splash");
const site = document.getElementById("site");
const enterBtn = document.getElementById("enterBtn");

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

const startReadingBtn = document.getElementById("startReading");
const continueReadingBtn = document.getElementById("continueReading");

const chaptersList = document.querySelector(".chapters-list");
const chapterItems = document.querySelectorAll(".chapter-item");

const reader = document.getElementById("reader");
const readerTitle = document.getElementById("readerTitle");
const readerText = document.getElementById("readerText");

const backToChapters = document.getElementById("backToChapters");

const readingSettingsBtn =
    document.getElementById("readingSettingsBtn");

const readingSettingsPanel =
    document.getElementById("readingSettingsPanel");

const closeReadingSettings =
    document.getElementById("closeReadingSettings");

const replayIntro =
    document.getElementById("replayIntro");

const animationsToggle =
    document.getElementById("animationsToggle");

const readerThemeButtons =
    document.querySelectorAll("[data-reader-theme]");

const readerFontButtons =
    document.querySelectorAll("[data-reader-font]");

const fontStepButtons =
    document.querySelectorAll("[data-font-step]");

const lineStepButtons =
    document.querySelectorAll("[data-line-step]");


/* ==================================================
   التخزين
================================================== */

const STORAGE_KEY = "broken_throne_state";


const DEFAULT_STATE = {

    splashSeen: false,

    lastChapter: 1,

    animations: true,

    reader: {
        fontSize: 1.15,
        lineHeight: 2.1,
        theme: "dark",
        font: "cairo"
    }

};


function loadState(){

    try{

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if(!saved){
            return structuredClone(DEFAULT_STATE);
        }

        const parsed =
            JSON.parse(saved);

        return {

            ...structuredClone(DEFAULT_STATE),

            ...parsed,

            reader: {
                ...structuredClone(DEFAULT_STATE.reader),
                ...(parsed.reader || {})
            }

        };

    }catch(error){

        console.warn(
            "تعذر قراءة بيانات التخزين:",
            error
        );

        return structuredClone(DEFAULT_STATE);
    }
}


let appState = loadState();


function saveState(){

    try{

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appState)
        );

    }catch(error){

        console.warn(
            "تعذر حفظ بيانات الموقع:",
            error
        );
    }
}


/* ==================================================
   الحركة
================================================== */

function systemPrefersReducedMotion(){

    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


function applyMotionSettings(){

    const disabled =
        !appState.animations ||
        systemPrefersReducedMotion();

    document.body.classList.toggle(
        "no-animations",
        disabled
    );

    animationsToggle.checked =
        appState.animations;
}


/* ==================================================
   شاشة الدخول
================================================== */

function showSite(){

    splash.classList.add("hidden");

    site.classList.remove("hidden");

    appState.splashSeen = true;

    saveState();
}


function enterSite(){

    if(
        appState.animations &&
        !systemPrefersReducedMotion()
    ){

        splash.classList.add("fade-out");

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


replayIntro.addEventListener(
    "click",
    () => {

        site.classList.add("hidden");

        splash.classList.remove(
            "hidden",
            "fade-out"
        );

        appState.splashSeen = false;

        saveState();

        resetReader();

        goToPage("home");

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }
);


/* ==================================================
   التنقل
================================================== */

function goToPage(target){

    const targetPage =
        document.getElementById(target);

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

        resetReader();

    }


    window.scrollTo({
        top: 0,
        behavior:
            systemPrefersReducedMotion()
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
   الصفحة الرئيسية
================================================== */

startReadingBtn.addEventListener(
    "click",
    () => {

        goToPage("chapters");

        openChapter(1);

    }
);


continueReadingBtn.addEventListener(
    "click",
    () => {

        goToPage("chapters");

        openChapter(
            appState.lastChapter || 1
        );

    }
);


/* ==================================================
   بيانات الفصول
================================================== */

const chapters = {

    1: {

        title: "أمام العرش",

        content: `
            <p>
                كان الصمت يملأ قاعة المحكمة،
                حتى إن صوت أنفاس الواقفين كان يبدو
                واضحًا وسط ذلك السكون الثقيل.
            </p>

            <p>
                وقف الطفل في منتصف القاعة،
                وعيناه تتحركان بين الوجوه من حوله.
                لم يفهم لماذا كان الجميع ينظر إليه
                بهذه الطريقة.
            </p>

            <p>
                وفي نهاية القاعة، خلف درجات حجرية
                مرتفعة، كان العرش ينتصب في الظلام.
            </p>

            <p>
                لم يكن هناك ملك يجلس عليه.
                ومع ذلك، لم يجرؤ أحد على الاقتراب منه.
            </p>
        `

    },


    2: {

        title: "القاضي يتكلم",

        content: `
            <p>
                رفع القاضي عينيه ببطء،
                ثم نظر مباشرة إلى الطفل.
            </p>

            <p>
                لم يتحدث أحد طوال تلك اللحظات،
                وكأن الجميع كان ينتظر الكلمات
                التي ستخرج من فم الرجل العجوز.
            </p>

            <p>
                أخيرًا، وضع القاضي يده على الطاولة.
                وانعكس صوت الضربة الخفيفة
                في أنحاء القاعة.
            </p>

            <p>
                عندها بدأ الكلام.
            </p>
        `

    },


    3: {

        title: "حكم لم يُنتظر",

        content: `
            <p>
                لم يكن الحكم هو ما توقعه أحد.
            </p>

            <p>
                تبادل الشيوخ النظرات،
                بينما بقي الطفل واقفًا في مكانه،
                لا يعرف شيئًا عن القرار الذي
                سيغيّر حياته.
            </p>

            <p>
                ثم أعلن القاضي الحكم.
            </p>

            <p>
                وفي اللحظة نفسها،
                بدا أن شيئًا ما قد انكسر
                داخل أروقة القصر.
            </p>
        `

    }

};


/* ==================================================
   فتح الفصل
================================================== */

function openChapter(chapterNumber){

    const chapter =
        chapters[chapterNumber];

    if(!chapter){

        console.warn(
            "الفصل غير موجود:",
            chapterNumber
        );

        return;
    }


    readerTitle.textContent =
        chapter.title;


    readerText.innerHTML =
        chapter.content;


    chaptersList.classList.add(
        "hidden"
    );


    reader.classList.remove(
        "hidden"
    );


    readingSettingsPanel.classList.add(
        "hidden"
    );


    appState.lastChapter =
        Number(chapterNumber);


    saveState();


    applyReaderSettings();


    window.scrollTo({
        top: 0,
        behavior:
            systemPrefersReducedMotion()
                ? "auto"
                : "smooth"
    });

}


chapterItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                const chapterNumber =
                    Number(item.dataset.chapter);

                openChapter(
                    chapterNumber
                );

            }
        );

    }
);


/* ==================================================
   العودة إلى قائمة الفصول
================================================== */

function resetReader(){

    reader.classList.add(
        "hidden"
    );

    chaptersList.classList.remove(
        "hidden"
    );

    readingSettingsPanel.classList.add(
        "hidden"
    );

}


backToChapters.addEventListener(
    "click",
    () => {

        resetReader();

        window.scrollTo({
            top: 0,
            behavior:
                systemPrefersReducedMotion()
                    ? "auto"
                    : "smooth"
        });

    }
);


/* ==================================================
   إعدادات القراءة
================================================== */

function applyReaderSettings(){

    readerText.style.setProperty(
        "--reader-font-size",
        `${appState.reader.fontSize}rem`
    );


    readerText.style.setProperty(
        "--reader-line-height",
        appState.reader.lineHeight
    );


    readerText.classList.remove(
        "theme-dark",
        "theme-sepia",
        "theme-light"
    );


    readerText.classList.add(
        `theme-${appState.reader.theme}`
    );


    readerText.classList.remove(
        "font-cairo",
        "font-ruqaa"
    );


    readerText.classList.add(
        `font-${appState.reader.font}`
    );


    readerThemeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.readerTheme ===
                appState.reader.theme
            );

        }
    );


    readerFontButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.readerFont ===
                appState.reader.font
            );

        }
    );

}


/* ==================================================
   فتح وإغلاق لوحة الإعدادات
================================================== */

readingSettingsBtn.addEventListener(
    "click",
    () => {

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
   حجم الخط
================================================== */

fontStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(button.dataset.fontStep);


                appState.reader.fontSize =
                    Math.min(
                        1.6,
                        Math.max(
                            0.9,
                            Number(
                                (
                                    appState.reader.fontSize +
                                    (step * 0.1)
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
   تباعد الأسطر
================================================== */

lineStepButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const step =
                    Number(button.dataset.lineStep);


                appState.reader.lineHeight =
                    Math.min(
                        3,
                        Math.max(
                            1.4,
                            Number(
                                (
                                    appState.reader.lineHeight +
                                    (step * 0.15)
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
   خلفية القراءة
================================================== */

readerThemeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                appState.reader.theme =
                    button.dataset.readerTheme;

                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   نوع الخط
================================================== */

readerFontButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                appState.reader.font =
                    button.dataset.readerFont;

                saveState();

                applyReaderSettings();

            }
        );

    }
);


/* ==================================================
   إعدادات الموقع
================================================== */

animationsToggle.addEventListener(
    "change",
    () => {

        appState.animations =
            animationsToggle.checked;

        saveState();

        applyMotionSettings();

    }
);


/* ==================================================
   لوحة الإعدادات + زر Escape
================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            readingSettingsPanel.classList.add(
                "hidden"
            );

        }

    }
);


/* ==================================================
   تهيئة التطبيق
================================================== */

function initializeApp(){

    applyMotionSettings();

    applyReaderSettings();


    if(appState.splashSeen){

        splash.classList.add(
            "hidden"
        );

        site.classList.remove(
            "hidden"
        );

    }else{

        splash.classList.remove(
            "hidden"
        );

        site.classList.add(
            "hidden"
        );

    }


    goToPage("home");

    resetReader();

}


initializeApp();
