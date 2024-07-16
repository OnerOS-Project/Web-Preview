import React, { useEffect, useRef, useState } from "react";

const AppSwitcher = () => {
    const [readElements, setReadElements] = useState<any[]>([]);
    const appToggled = useRef<HTMLDivElement | null>(null);

    const displayToggledApp = async (id: string) => {
        const getWindow = document.getElementById(id);

        if (getWindow) {
            document.querySelectorAll(".window").forEach(window => {
                window.classList.remove('active')
            });
            getWindow.classList.add("active");
            const runAppSwitcher = document.getElementById("run-app-switcher");

            if (runAppSwitcher) {
                await delay(100);
                runAppSwitcher.click();
                runAppSwitcher.focus();
            } else {
                console.warn("run-app-switcher element not found");
            }
        } else {
            console.warn(`Element with id ${id} not found`);
        }
    };

    useEffect(() => {
        const windowElements = document.querySelectorAll('.window');

        const elementsArray = Array.from(windowElements).map(element => {
            return element;
        });

        setReadElements(elementsArray);
    }, []);

    return (
        <div className="app-switcher">
            {readElements.length >= 1 && <h3>Select app to switch: </h3>}
            {readElements.map((elm: any) => (
                <div
                    key={elm.id}
                    className="app"
                    ref={appToggled}
                    onClick={() => displayToggledApp(elm.id)}
                >
                    {elm.textContent.split("⎯")[0]}
                </div>
            ))}
            {readElements.length < 1 && <h3>App Switcher - open any app to use</h3>}
        </div>
    );
};

// Delay function
const delay = (ms: number) => new Promise<void>(resolve => {
    setTimeout(resolve, ms);
});

export default AppSwitcher;
