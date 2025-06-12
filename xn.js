class PasswordGenerator {
  constructor() {
    this.isManualMode = false
    this.initializeElements()
    this.initializeEventListeners()
    this.updateTotalLength()
    this.generatePassword()
  }

  initializeElements() {
    this.passwordDisplay = document.getElementById("password-display")
    this.uppercaseCount = document.getElementById("uppercase-count")
    this.lowercaseCount = document.getElementById("lowercase-count")
    this.numbersCount = document.getElementById("numbers-count")
    this.symbolsCount = document.getElementById("symbols-count")
    this.totalLength = document.getElementById("total-length")

    this.autoModeBtn = document.getElementById("auto-mode")
    this.manualModeBtn = document.getElementById("manual-mode")
    this.autoSettings = document.getElementById("auto-settings")
    this.manualSettings = document.getElementById("manual-settings")

    this.avoidSimilar = document.getElementById("avoid-similar")
    this.avoidAmbiguous = document.getElementById("avoid-ambiguous")
    this.ensureEachType = document.getElementById("ensure-each-type")

    this.copyBtn = document.getElementById("copy-btn")
    this.generateBtn = document.getElementById("generate-btn")
    this.generateNewBtn = document.getElementById("generate-new-btn")
    this.clearBtn = document.getElementById("clear-btn")
    this.numberBtns = document.querySelectorAll(".number-btn")

    this.strengthText = document.getElementById("strength-text")
    this.strengthFill = document.getElementById("strength-fill")
    this.crackTime = document.getElementById("crack-time")
    this.errorMessage = document.getElementById("error-message")

    this.toast = document.getElementById("toast")
    this.toastMessage = document.getElementById("toast-message")
    this.toastClose = document.getElementById("toast-close")

    this.charSets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    }

    this.similarChars = "il1Lo0O"

    this.ambiguousChars = "{}[]()/\\'\"`~,;:.<>"
  }

  initializeEventListeners() {
    this.autoModeBtn.addEventListener("click", () => this.setMode("auto"))
    this.manualModeBtn.addEventListener("click", () => this.setMode("manual"))

    this.passwordDisplay.addEventListener("input", () => {
      if (this.isManualMode) {
        this.analyzeManualPassword()
      }
    })

  
    const countInputs = [this.uppercaseCount, this.lowercaseCount, this.numbersCount, this.symbolsCount]

    countInputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (!this.isManualMode) {
          this.validateInput(input)
          this.updateTotalLength()
          this.generatePassword()
        }
      })
    })

    this.numberBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!this.isManualMode) {
          const targetId = btn.getAttribute("data-target")
          const input = document.getElementById(targetId)
          const currentValue = Number.parseInt(input.value) || 0

          if (btn.classList.contains("plus")) {
            input.value = Math.min(50, currentValue + 1)
          } else if (btn.classList.contains("minus")) {
            input.value = Math.max(0, currentValue - 1)
          }

          this.validateInput(input)
          this.updateTotalLength()
          this.generatePassword()
        }
      })
    })


    ;[this.avoidSimilar, this.avoidAmbiguous, this.ensureEachType].forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (!this.isManualMode) {
          this.generatePassword()
        }
      })
    })

    this.copyBtn.addEventListener("click", () => this.copyToClipboard())
    this.generateBtn.addEventListener("click", () => {
      if (!this.isManualMode) {
        this.generatePassword()
      }
    })
    this.generateNewBtn.addEventListener("click", () => {
      if (!this.isManualMode) {
        this.generatePassword()
      }
    })
    this.clearBtn.addEventListener("click", () => this.clearPassword())

    this.toastClose.addEventListener("click", () => this.hideToast())

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "c":
            if (document.activeElement === this.passwordDisplay) {
              e.preventDefault()
              this.copyToClipboard()
            }
            break
          case "r":
            if (!this.isManualMode) {
              e.preventDefault()
              this.generatePassword()
            }
            break
        }
      }
    })
  }

  setMode(mode) {
    this.isManualMode = mode === "manual"

    if (this.isManualMode) {
      this.autoModeBtn.classList.remove("active")
      this.manualModeBtn.classList.add("active")
      this.autoSettings.style.display = "none"
      this.manualSettings.style.display = "block"
      this.passwordDisplay.removeAttribute("readonly")
      this.passwordDisplay.placeholder = "Digite sua senha aqui"
      this.generateNewBtn.style.display = "none"

      if (this.passwordDisplay.value) {
        this.analyzeManualPassword()
      } else {
        this.updateStrengthIndicator("", 0)
      }
    } else {
      this.manualModeBtn.classList.remove("active")
      this.autoModeBtn.classList.add("active")
      this.manualSettings.style.display = "none"
      this.autoSettings.style.display = "block"
      this.passwordDisplay.setAttribute("readonly", "true")
      this.passwordDisplay.placeholder = "Sua senha aparecerá aqui"
      this.generateNewBtn.style.display = "flex"

      this.generatePassword()
    }
  }

  analyzeManualPassword() {
    const password = this.passwordDisplay.value
    if (password) {
      this.calculateStrength(password)
    } else {
      this.updateStrengthIndicator("", 0)
    }
  }

  clearPassword() {
    this.passwordDisplay.value = ""
    this.updateStrengthIndicator("", 0)
    this.passwordDisplay.focus()
  }

  validateInput(input) {
    let value = Number.parseInt(input.value) || 0
    value = Math.max(0, Math.min(50, value))
    input.value = value
  }

  updateTotalLength() {
    const total =
      Number.parseInt(this.uppercaseCount.value) +
      Number.parseInt(this.lowercaseCount.value) +
      Number.parseInt(this.numbersCount.value) +
      Number.parseInt(this.symbolsCount.value)

    this.totalLength.textContent = total

    if (total === 0) {
      this.errorMessage.style.display = "block"
      this.generateNewBtn.disabled = true
      return false
    } else {
      this.errorMessage.style.display = "none"
      this.generateNewBtn.disabled = false
      return true
    }
  }

  generatePassword() {
    if (this.isManualMode || !this.updateTotalLength()) {
      return
    }

    const counts = {
      uppercase: Number.parseInt(this.uppercaseCount.value) || 0,
      lowercase: Number.parseInt(this.lowercaseCount.value) || 0,
      numbers: Number.parseInt(this.numbersCount.value) || 0,
      symbols: Number.parseInt(this.symbolsCount.value) || 0,
    }

    const filteredCharSets = this.getFilteredCharSets()

    let password = this.generateExactCharacters(counts, filteredCharSets)

    password = this.shuffleString(password)

    this.passwordDisplay.value = password
    this.calculateStrength(password)
  }

  getFilteredCharSets() {
    const filteredSets = { ...this.charSets }

    if (this.avoidSimilar.checked) {
      for (const char of this.similarChars) {
        for (const key in filteredSets) {
          filteredSets[key] = filteredSets[key].replace(new RegExp(char, "g"), "")
        }
      }
    }

    if (this.avoidAmbiguous.checked) {
      for (const char of this.ambiguousChars) {
        for (const key in filteredSets) {
          filteredSets[key] = filteredSets[key].replace(new RegExp("\\" + char, "g"), "")
        }
      }
    }

    return filteredSets
  }

  generateExactCharacters(counts, charSets) {
    let password = ""

    for (const type in counts) {
      if (counts[type] > 0 && charSets[type].length > 0) {
        for (let i = 0; i < counts[type]; i++) {
          const randomIndex = Math.floor(Math.random() * charSets[type].length)
          password += charSets[type][randomIndex]
        }
      }
    }

    return password
  }

  shuffleString(str) {
    const array = str.split("")
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array.join("")
  }

  calculateStrength(password) {
    if (!password) {
      this.updateStrengthIndicator("", 0)
      return
    }


    const uppercaseUsed = /[A-Z]/.test(password)
    const lowercaseUsed = /[a-z]/.test(password)
    const numbersUsed = /[0-9]/.test(password)
    const symbolsUsed = /[^A-Za-z0-9]/.test(password)

    let charsetSize = 0
    if (uppercaseUsed) charsetSize += 26
    if (lowercaseUsed) charsetSize += 26
    if (numbersUsed) charsetSize += 10
    if (symbolsUsed) charsetSize += 30 

    const entropy = password.length * Math.log2(charsetSize)

    let strength = "weak"

    if (entropy >= 60 && uppercaseUsed + lowercaseUsed + numbersUsed + symbolsUsed >= 3) {
      strength = "strong"
    } else if (entropy >= 40 && uppercaseUsed + lowercaseUsed + numbersUsed + symbolsUsed >= 2) {
      strength = "medium"
    }

    this.updateStrengthIndicator(strength, entropy)
  }

  updateStrengthIndicator(strength, entropy) {
    const strengthLabels = {
      weak: "Fraca",
      medium: "Média",
      strong: "Forte",
    }

    if (strength) {
      this.strengthText.textContent = strengthLabels[strength]
      this.strengthText.className = `strength-value ${strength}`
      this.strengthFill.className = `strength-fill ${strength}`

      const percentage = strength === "weak" ? 33 : strength === "medium" ? 66 : 100
      this.strengthFill.setAttribute("aria-valuenow", percentage)
      this.strengthFill.setAttribute("aria-label", `Força da senha: ${strengthLabels[strength]}`)
    } else {
      this.strengthText.textContent = ""
      this.strengthText.className = "strength-value"
      this.strengthFill.className = "strength-fill"
      this.strengthFill.setAttribute("aria-valuenow", 0)
    }

    
    this.updateCrackTime(entropy)
  }

  updateCrackTime(entropy) {
    if (!entropy) {
      this.crackTime.innerHTML = "Tempo estimado para quebrar: <strong>Calculando...</strong>"
      return
    }

    const crackTimeSeconds = Math.pow(2, entropy - 1) / 100e6
    const crackTimeDays = Math.floor(crackTimeSeconds / (60 * 60 * 24))

    let timeString = ""
    if (crackTimeDays < 1) {
      timeString = "Menos de 1 dia"
    } else if (crackTimeDays < 365) {
      timeString = `${crackTimeDays.toLocaleString("pt-BR")} dias`
    } else if (crackTimeDays < 365000) {
      const years = Math.floor(crackTimeDays / 365)
      timeString = `${years.toLocaleString("pt-BR")} anos`
    } else {
      timeString = "Mais de 1 milhão de anos"
    }

    this.crackTime.innerHTML = `Tempo estimado para quebrar: <strong>${timeString}</strong>`
  }

  async copyToClipboard() {
    const password = this.passwordDisplay.value
    if (!password) {
      this.showToast("Nenhuma senha para copiar", "error")
      return
    }

    try {
      await navigator.clipboard.writeText(password)
      this.showToast("Senha copiada!", "success")

      const originalHTML = this.copyBtn.innerHTML
      this.copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            `
      this.copyBtn.style.color = "var(--success-color)"

      setTimeout(() => {
        this.copyBtn.innerHTML = originalHTML
        this.copyBtn.style.color = ""
      }, 1000)
    } catch (err) {
      this.passwordDisplay.select()
      document.execCommand("copy")
      this.showToast("Senha copiada!", "success")
    }
  }

  showToast(message, type = "success") {
    this.toastMessage.textContent = message
    this.toast.className = `toast ${type}`
    this.toast.classList.add("show")

    setTimeout(() => {
      this.hideToast()
    }, 3000)
  }

  hideToast() {
    this.toast.classList.remove("show")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PasswordGenerator()
})

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.scrollBehavior = "smooth"

  const cards = document.querySelectorAll(".password-card, .settings-card, .tips-card")
  cards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease"

    setTimeout(() => {
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })
})
