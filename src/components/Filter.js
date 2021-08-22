import { React, Fragment, useState, useEffect } from "react";
import useClickOutside from "../hooks/ClickOutside";

export default function Filter({ field, values, update }) {
  const [selected, setSelected] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  function toggleMenu() {
    setShowMenu(!showMenu);
  }

  const ref = useClickOutside(toggleMenu);

  useEffect(() => {
    field && setSelected(field.col);
  }, []);

  return (
    <Fragment>
      {/*
  Custom select controls like this require a considerable amount of JS to implement from scratch. We're planning
  to build some low-level libraries to make this easier with popular frameworks like React, Vue, and even Alpine.js
  in the near future, but in the mean time we recommend these reference guides when building your implementation:

  https://www.w3.org/TR/wai-aria-practices/#Listbox
  https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
*/}
      <div>
        <label
          id="listbox-label"
          className="hidden text-sm font-medium text-gray-700"
        >
          Assigned to
        </label>
        <div className="relative flex -space-x-1">
          <button
            onClick={() => toggleMenu()}
            type="button"
            className="relative w-full bg-white border border-gray-300 rounded-l-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none  sm:text-sm"
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-labelledby="listbox-label"
          >
            <span className="flex items-center">
              <span className="ml-3 block truncate">{selected}</span>
            </span>
            <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {/* Heroicon name: solid/selector */}
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          <button
            onClick={() => {
              setSelected(field.col);
              update();
            }}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Clear</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/*
Select popover, show/hide based on select state.

Entering: ""
  From: ""
  To: ""
Leaving: "transition ease-in duration-100"
  From: "opacity-100"
  To: "opacity-0"
    */}
          {showMenu && (
            <ul
              ref={ref}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-3"
            >
              {/*
  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

  Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
*/}
              {values &&
                values.map((value, index) => {
                  return (
                    <li
                      key={index}
                      className="hover:text-white hover:bg-indigo-600 text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9"
                      id="listbox-option-0"
                      role="option"
                    >
                      <div className="flex items-center">
                        {/* Selected: "font-semibold", Not Selected: "font-normal" */}
                        <span
                          onClick={() => {
                            setSelected(value);
                            update({ field, value });
                            toggleMenu();
                          }}
                          className="font-normal ml-3 block truncate"
                        >
                          {value}
                        </span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </Fragment>
  );
}
