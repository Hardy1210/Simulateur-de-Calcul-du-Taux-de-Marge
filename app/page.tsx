'use client'

import { cn } from '@/lib/utils'
import Dinero from 'dinero.js'
import { useState } from 'react'
import Button from './components/buttons/Button'
import ErrorMessage from './components/errors/ErrorMessage'
import { Section } from './components/section/Section'
import style from './page.module.scss'

export default function Home() {
  // États
  const [calculationType, setCalculationType] = useState<string>('coefficient')
  const [tva, setTva] = useState<number>(20)
  const [tvaLabel, setTvaLabel] = useState<string>('') // Valor visual
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('') // Prix d'achat HT
  const [dynamicInput, setDynamicInput] = useState<number | ''>('') // Champ dynamique (ex. Taux de marge ou Coefficient)
  const [result, setResult] = useState<string>('')
  const [purchasePriceError, setPurchasePriceError] = useState<string>('') // Error de purchasePrice
  const [dynamicInputError, setDynamicInputError] = useState<string>('') // Error de dynamicInput

  // const [tvaDescription, setTvaDescription] = useState('');

  // Détermine le label dynamique selon le type de calcul
  const getDynamicLabel = () => {
    switch (calculationType) {
      case 'coefficient':
        return 'Coefficient multiplicateur'
      case 'taux-marge':
        return 'Taux de marge'
      case 'prix-vente-ttc':
        return 'Prix de vente TTC (€)'
      default:
        return 'Valeur'
    }
  }

  const validateInputs = () => {
    let isValid = true

    if (!purchasePrice || purchasePrice <= 0) {
      setPurchasePriceError(
        "Veuillez entrer une valeur valide pour le Prix d'achat HT.",
      )
      isValid = false
    } else {
      setPurchasePriceError('')
    }

    if (!dynamicInput || dynamicInput <= 0) {
      setDynamicInputError(
        'Veuillez entrer une valeur valide pour le champ dynamique.',
      )
      isValid = false
    } else {
      setDynamicInputError('')
    }

    return isValid
  }

  const calculate = () => {
    if (!validateInputs()) return

    const purchasePriceDinero = Dinero({
      amount: Math.round(
        (typeof purchasePrice === 'number' ? purchasePrice : 0) * 100,
      ),
    })
    const dynamicInputDinero = Dinero({
      amount: Math.round((dynamicInput || 0) * 100),
    })

    let sellingPriceHT = Dinero({ amount: 0 })
    let sellingPriceTTC = Dinero({ amount: 0 })
    let margin = Dinero({ amount: 0 })

    if (calculationType === 'coefficient') {
      sellingPriceHT = purchasePriceDinero.multiply(
        typeof dynamicInput === 'number' ? dynamicInput : 0,
      )
      sellingPriceTTC = sellingPriceHT.multiply(1 + tva / 100)
      margin = sellingPriceHT.subtract(purchasePriceDinero)
    } else if (calculationType === 'prix-vente-ttc') {
      sellingPriceTTC = dynamicInputDinero
      sellingPriceHT = sellingPriceTTC.divide(1 + tva / 100)
      margin = sellingPriceHT.subtract(purchasePriceDinero)
    } else if (calculationType === 'taux-marge') {
      sellingPriceHT = purchasePriceDinero.multiply(
        1 + (typeof dynamicInput === 'number' ? dynamicInput / 100 : 0),
      )
      sellingPriceTTC = sellingPriceHT.multiply(1 + tva / 100)
      margin = sellingPriceHT.subtract(purchasePriceDinero)
    }

    const coefficientTTC =
      sellingPriceTTC.getAmount() / purchasePriceDinero.getAmount()
    const marginRate =
      Math.floor(
        (margin.getAmount() / purchasePriceDinero.getAmount()) * 100 * 100,
      ) / 100

    const calculatedResult = `Prix d'achat HT : ${(purchasePriceDinero.getAmount() / 100).toFixed(2)} €<br>
    Prix de vente HT : ${(sellingPriceHT.getAmount() / 100).toFixed(2)} €<br>
    Prix de vente TTC : ${(sellingPriceTTC.getAmount() / 100).toFixed(2)} €<br>
    Marge : ${(margin.getAmount() / 100).toFixed(2)} €<br>
    Coefficient (TTC) : ${coefficientTTC.toFixed(2)}<br>
    Taux de marge (%) : ${marginRate.toFixed(2)}%<br>`

    setResult(calculatedResult)
  }
  return (
    <>
      <main className={cn(style.main, 'my-10')}>
        <Section className={cn(style.section, 'flex flex-col gap-4 px-5 ')}>
          <div
            className={cn(style.container, 'p-10 border rounded-md shadow-md')}
          >
            <h1 className="text-center text-xl md:text-2xl mb-10">
              Simulateur de Calcul du Taux de Marge
            </h1>

            <div className={cn(style.dynamicInput, 'mb-5')}>
              <label htmlFor="purchasePrice">
                Prix d&apos;achat HT
                <span className="text-red-600">*</span> :
              </label>
              {/*attention aux champs j'ai ajoute une const pour pouvoir change la valeur de number a text pour
              elimine les fleches indesirables dans l'input */}
              <input
                id="purchasePrice"
                type="text"
                value={purchasePrice}
                className="pr-5 w-full h-12 border border-neutral-400/50 rounded-sm text-right"
                onChange={(e) => {
                  const value = e.target.value
                  setPurchasePrice(
                    value ? parseFloat(value.replace(',', '.')) || '' : '',
                  )
                }}
                placeholder="€"
              />
              {purchasePriceError && (
                <ErrorMessage messages={[purchasePriceError]} />
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="calculationType">
                Calcul à partir de<span className="text-red-600">*</span> :
              </label>
              <select
                id="calculationType"
                className="w-full h-12 border border-neutral-400/50 rounded-sm text-center"
                value={calculationType}
                onChange={(e) => setCalculationType(e.target.value)}
              >
                <option value="coefficient">Coefficient</option>
                <option value="prix-vente-ttc">Prix de vente TTC</option>
                <option value="taux-marge">Taux de marge</option>
              </select>
            </div>

            <div className={cn(style.dynamicInput, 'mb-5')}>
              <label htmlFor="dynamicInput">
                {getDynamicLabel()}
                <span className="text-red-600">*</span> :
              </label>
              {/*attention aux champs j'ai ajoute une const pour pouvoir change la valeur de number a text pour
              elimine les fleches indesirables dans l'input */}
              <input
                id="dynamicInput"
                type="text"
                className={cn(
                  style.placeholder,
                  ' w-full h-12 border border-neutral-400/50 rounded-sm text-right',
                )}
                value={dynamicInput}
                onChange={(e) => {
                  const value = e.target.value
                  setDynamicInput(
                    value ? parseFloat(value.replace(',', '.')) || '' : '',
                  )
                }}
                placeholder={
                  calculationType === 'coefficient'
                    ? ''
                    : calculationType === 'prix-vente-ttc'
                      ? '€'
                      : '%'
                }
              />
              {dynamicInputError && (
                <ErrorMessage messages={[dynamicInputError]} />
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="tva">
                TVA<span className="text-red-600">*</span> :
              </label>
              <select
                id="tva"
                value={tvaLabel}
                className="w-full h-12 border border-neutral-400/50 rounded-sm text-center"
                onChange={(e) => {
                  const mapping: Record<
                    string,
                    { value: number; label: string }
                  > = {
                    '0-non-soumis': { value: 0, label: '0-non-soumis' },
                    '0-auto-liquidation': {
                      value: 0,
                      label: '0-auto-liquidation',
                    },
                    '5.5-reduit': { value: 5.5, label: '5.5-reduit' },
                    '5.5-cee': { value: 5.5, label: '5.5-cee' },
                    '10-reduit': { value: 10, label: '10-reduit' },
                    '10-cee': { value: 10, label: '10-cee' },
                    '19.6-normal': { value: 19.6, label: '19.6-normal' },
                    '19.6-cee': { value: 19.6, label: '19.6-cee' },
                    '20-auto-achat': { value: 20.0, label: '20-auto-achat' },
                    '20-cee': { value: 20.0, label: '20-cee' },
                  }

                  const selectedKey = e.target.value

                  if (selectedKey in mapping) {
                    setTva(mapping[selectedKey].value) // Actualiza el valor numérico
                    setTvaLabel(mapping[selectedKey].label) // Actualiza el valor visual
                  } else {
                    const numericValue = Number(selectedKey)
                    setTva(numericValue) // Si no está en el mapping, guarda el valor numérico
                    setTvaLabel(selectedKey) // Guarda el valor visual como string
                  }
                }}
              >
                <optgroup label="Taux normaux">
                  <option value={20}>Taux 20%</option>
                </optgroup>
                <optgroup label="Taux réduits">
                  <option value={2.1}>Taux réduit 2,1%</option>
                  <option value="5.5-reduit">Taux réduit 5,5%</option>
                  <option value={8.5}>Taux réduit 8,5%</option>
                  <option value="10-reduit">Taux réduit 10%</option>
                </optgroup>
                <optgroup label="Taux Cee">
                  <option value="5.5-cee">CEE 5,5%</option>
                  <option value="10-cee">CEE 10%</option>
                  <option value="19.6-cee">CEE</option>
                  <option value="20-cee">CEE 20%</option>
                </optgroup>
                <optgroup label="Autres taux">
                  <option value="0-non-soumis">Non soumis 0%</option>
                  <option value="0-auto-liquidation">
                    Auto-liquidación Vente
                  </option>
                  <option value={2.0}>Taux 20% (10% récupérable)</option>
                  <option value={3.8}>Taux 3,8%</option>
                  <option value={4.0}>Taux 20% (20% récupérable)</option>
                  <option value={4.7}>Taux réduit 4,7%</option>
                  <option value={5}>Taux réduit 5%</option>
                  <option value={7}>Taux réduit 7%</option>
                  <option value={8.0}>Taux 20% (40% récupérable)</option>
                  <option value={12.0}>Taux 20% (60% récupérable)</option>
                  <option value={13.0}>Taux 13%</option>
                  <option value={15.0}>Taux 15%</option>
                  <option value={15.1}>Taux réduit 15,1%</option>
                  <option value={15.38}>Taux 20% (80% récupérable)</option>
                  <option value={16.0}>Taux 16%</option>
                  <option value="19.6-normal">Taux normal 19,6%</option>
                  <option value="20-auto-achat">Auto-liquidation Achat</option>
                  <option value={21.0}>Taux 21%</option>
                </optgroup>
              </select>
            </div>

            <Button onClick={calculate}>Calculer</Button>
          </div>

          {result && (
            <div
              className="p-10 border rounded-md shadow-md"
              dangerouslySetInnerHTML={{ __html: result }}
            />
          )}
        </Section>
      </main>
    </>
  )
}
