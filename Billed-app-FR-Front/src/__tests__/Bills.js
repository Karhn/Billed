/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { modal } from "../views/DashboardFormUI.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then I click on New Bill button, I should be redirected to NewBill page", () => {

      document.body.innerHTML = BillsUI({data:[]})

      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      })

      Object.defineProperty(window, 'localStorage', { value : localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const store = null
      const billsContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const buttonNewBill = screen.getByTestId('btn-new-bill')
      fireEvent.click(buttonNewBill)

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    })

    test("Tehn I click on eyes icon, a modal should open", () => {

      Object.defineProperty(window, 'localStorage', { value : localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const oneBill = [{
        id: "1",
        date: "2020-01-01",
        status: "pending",
        type: "Transports",
        name: "test",
        amount: 100,
        fileUrl: "http://localhost:5678/public/bill.jpg",
      }]
      
      document.body.innerHTML = BillsUI({data: oneBill})

      $.fn.modal = jest.fn()
      
      const store = null
      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      })

      const billsContainer = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye)
      const iconEye = screen.getAllByTestId('icon-eye')[0]
      iconEye.addEventListener("click", () => handleClickIconEye(iconEye))
      fireEvent.click(iconEye)

      expect(handleClickIconEye).toHaveBeenCalled()

      expect($.fn.modal).toHaveBeenCalledWith("show")
    })
  })
})
