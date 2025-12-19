/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock  } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock})
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }))
      document.body.innerHTML = NewBillUI()
    })

    test("Then I submitting the form should navigate to Bills", () => {

      const onNavigate = jest.fn()
      const store = null

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      })

      screen.getByTestId("expense-type").value = "Hotel"
      screen.getByTestId("expense-name").value = "Seoul"
      screen.getByTestId("amount").value = "150"
      screen.getByTestId("datepicker").value = "2025-12-12"
      screen.getByTestId("vat").value = "10"
      screen.getByTestId("pct").value = "30"
      screen.getByTestId("commentary").value = "note"
      newBill.fileUrl = "http://localhost:5678/public/bill.jpg"
      newBill.fileName = "bill.jpg"
    

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
    })

    test("Then I upload a file with invalid extension, it should alert and reset input", () => {

      window.alert = jest.fn()

      const onNavigate = jest.fn()
      const createMock = jest.fn()
      const store = { bills: () => ({ create: createMock })}

      const newBill = new NewBill({ 
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      })

      const input = screen.getByTestId("file")

      Object.defineProperty(input, "files", {
        value: [new File (["x"], "test.pdf", { type: "application/pdf" })]
      })

      const event = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.pdf"}
      }

      newBill.handleChangeFile(event)

      expect(window.alert).toHaveBeenCalled()
      expect(input.value).toBe("")
      expect(createMock).not.toHaveBeenCalled()
    })

    test("Then I upload a file with valid extension, it should call store and set fileUrl/fileName/billId", async () => {

      const createMock = jest.fn().mockResolvedValue({
        fileUrl:"http://localhost:5678/public/bill.jpg",
        key: "777"
      })

      const onNavigate = jest.fn()
      const store = { bills: () => ({ create: createMock })}

      const newBill = new NewBill({ 
      document,
      onNavigate,
      store,
      localStorage: window.localStorage
      })

      const input = screen.getByTestId("file")

      Object.defineProperty(input, "files", {
        value: [new File (["x"], "bill.jpg", { type: "image/jpg" })]
      })

      const event = {
      preventDefault: jest.fn(),
      target: { value: "C:\\fakepath\\bill.jpg"}
      }

      newBill.handleChangeFile(event)

      await Promise.resolve()

      expect(newBill.fileUrl).toBe("http://localhost:5678/public/bill.jpg")
      expect(newBill.fileName).toBe("bill.jpg")
      expect(newBill.billId).toBe("777")
    })
  })
})

describe("Give I am a user connected as Employee", () => {
  describe("When I navigate to NewBill", () => {
    test("")
  })
})