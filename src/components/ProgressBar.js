import { React, Fragment, useState, useEffect } from "react";
import ReactDOM, { createPortal } from "react-dom";

export default function ProgressBar({ isShowing, hide, progress, remaining }) {
  const [show, setShow] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  });

  function toggle() {
    setShow(!show);
  }

  function create() {
    return (
      <div
        className="fixed z-10 inset-0 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/*
      Background overlay, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          />
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            ​
          </span>
          {/*
      Modal panel, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        To: "opacity-100 translate-y-0 sm:scale-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100 translate-y-0 sm:scale-100"
        To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    */}
          <div className="h-28 inline-block align-bottom bg-indigo-600 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div
              className="h-full  bg-indigo-700 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center ">
              <span className="xt-4xl tracking-tight font-extrabold text-gray-200 sm:text-5xl md:text-6xl">
                {progress}%
              </span>
              <span class="text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                {remaining}secs remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return !isReady ? null : createPortal(create(), document.body);
}
