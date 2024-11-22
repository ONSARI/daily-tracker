import React, { useState, useMemo } from 'react';

function InputField({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-base"
        placeholder={placeholder}
      />
    </div>
  );
}

function Dashboard() {
  const [inputData, setInputData] = useState({
    arsToPay: '',
    usdtToPay: '',
    usdtBrlRate: '',
    usdtArsRate: '',
    brlReceived: '',
    numberOfOperations: '',
    brlGeneratedFromUsdt: ''
  });

  // State for the selected date
  const [selectedDate, setSelectedDate] = useState('');

  // State for saved operations
  const [savedOperations, setSavedOperations] = useState([]);

  // State to control visibility of saved operations
  const [showSavedOperations, setShowSavedOperations] = useState(false);

  // Update the selected date
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const EXCHANGE_COMMISSION = 0.005;
  const IOF_TAX = 0.0038;
  const SELLER_COMMISSION = 0.005;
  const PIX_COST_BRL = 0.30;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const brlIndividual = parseFloat(inputData.brlReceived) || 0;
  const brlGeneratedFromUsdt = parseFloat(inputData.brlGeneratedFromUsdt) || 0;
  const totalBrl = brlIndividual + brlGeneratedFromUsdt;

  const arsToPay = parseFloat(inputData.arsToPay) || 0;
  const numberOfOperations = parseInt(inputData.numberOfOperations) || 0;
  const usdtBrlRate = parseFloat(inputData.usdtBrlRate) || 0;
  const usdtArsRate = parseFloat(inputData.usdtArsRate) || 0;
  const usdtToPay = parseFloat(inputData.usdtToPay) || 0;

  const usdtOperated = useMemo(() => {
    return totalBrl && usdtBrlRate ? totalBrl / usdtBrlRate : 0;
  }, [totalBrl, usdtBrlRate]);

  const arsGenerated = useMemo(() => {
    return (brlIndividual && usdtBrlRate && usdtArsRate)
      ? (brlIndividual / usdtBrlRate) * usdtArsRate
      : 0;
  }, [brlIndividual, usdtBrlRate, usdtArsRate]);

  const averageTicketUsdt = useMemo(() => {
    return numberOfOperations > 0 ? usdtOperated / numberOfOperations : 0;
  }, [usdtOperated, numberOfOperations]);

  const pixCostBrl = useMemo(() => {
    return numberOfOperations * PIX_COST_BRL;
  }, [numberOfOperations]);

  const pixCostArs = useMemo(() => {
    return usdtBrlRate && usdtArsRate
      ? (pixCostBrl / usdtBrlRate) * usdtArsRate
      : 0;
  }, [pixCostBrl, usdtBrlRate, usdtArsRate]);

  const exchangeCommission = useMemo(() => {
    return arsToPay * EXCHANGE_COMMISSION;
  }, [arsToPay]);

  const iofTax = useMemo(() => {
    return arsToPay * IOF_TAX;
  }, [arsToPay]);

  const sellerCommission = useMemo(() => {
    return arsToPay * SELLER_COMMISSION;
  }, [arsToPay]);

  const totalVariableCosts = useMemo(() => {
    return exchangeCommission + iofTax + sellerCommission + pixCostArs;
  }, [exchangeCommission, iofTax, sellerCommission, pixCostArs]);

  const profitFromUsdtOperations = useMemo(() => {
    return brlGeneratedFromUsdt - (usdtToPay * usdtBrlRate);
  }, [brlGeneratedFromUsdt, usdtToPay, usdtBrlRate]);

  const grossIncome = useMemo(() => {
    return arsGenerated - arsToPay;
  }, [arsGenerated, arsToPay]);

  const netIncome = useMemo(() => {
    return grossIncome - totalVariableCosts;
  }, [grossIncome, totalVariableCosts]);

  const grossIncomeUsdt = useMemo(() => {
    return usdtArsRate ? grossIncome / usdtArsRate : 0;
  }, [grossIncome, usdtArsRate]);

  const netIncomeUsdt = useMemo(() => {
    return usdtArsRate ? netIncome / usdtArsRate : 0;
  }, [netIncome, usdtArsRate]);

  const grossIncomeBrl = useMemo(() => {
    return (grossIncomeUsdt * usdtBrlRate) + profitFromUsdtOperations;
  }, [grossIncomeUsdt, usdtBrlRate, profitFromUsdtOperations]);

  const netIncomeBrl = useMemo(() => {
    return (netIncomeUsdt * usdtBrlRate) + profitFromUsdtOperations;
  }, [netIncomeUsdt, usdtBrlRate, profitFromUsdtOperations]);

  // Format the selected date
  const formattedDate = useMemo(() => {
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      return '';
    }
  }, [selectedDate]);

  // Function to handle CSV export
  const handleExportCSV = () => {
    const dataToExport = [
      { label: 'Date', value: formattedDate || 'N/A' },
      { label: 'ARS to Pay', value: arsToPay },
      { label: 'USDT to Pay', value: usdtToPay },
      { label: 'USDT/BRL Rate', value: usdtBrlRate },
      { label: 'USDT/ARS Rate', value: usdtArsRate },
      { label: 'BRL Received', value: brlIndividual },
      { label: 'BRL from USDT', value: brlGeneratedFromUsdt },
      { label: 'Number of Operations', value: numberOfOperations },
      { label: 'Total BRL', value: totalBrl },
      { label: 'USDT Operated', value: usdtOperated },
      { label: 'Average Ticket USDT', value: averageTicketUsdt },
      { label: 'ARS Generated', value: arsGenerated },
      { label: 'Gross Income (ARS)', value: grossIncome },
      { label: 'Net Income (ARS)', value: netIncome },
      { label: 'Gross Income (BRL)', value: grossIncomeBrl },
      { label: 'Net Income (BRL)', value: netIncomeBrl },
      { label: 'Gross Income (USDT)', value: grossIncomeUsdt },
      { label: 'Net Income (USDT)', value: netIncomeUsdt },
      { label: 'Exchange Commission (ARS)', value: exchangeCommission },
      { label: 'I.O.F Tax (ARS)', value: iofTax },
      { label: 'Seller Commission (ARS)', value: sellerCommission },
      { label: 'PIX Cost (ARS)', value: pixCostArs },
      { label: 'Total Variable Costs (ARS)', value: totalVariableCosts },
      { label: 'Gross Profit (%)', value: arsGenerated > 0 ? (grossIncome / arsGenerated) * 100 : 0 },
      { label: 'Variable Costs (%)', value: arsGenerated > 0 ? ((grossIncome - netIncome) / arsGenerated) * 100 : 0 },
      { label: 'Net Profit (%)', value: arsGenerated > 0 ? (netIncome / arsGenerated) * 100 : 0 },
    ];

    let csvContent = 'Data,Value\n';

    dataToExport.forEach(item => {
      csvContent += `${item.label},${item.value}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(link.setAttribute('download', `dashboard_data_${selectedDate || 'N_A'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle saving operations
  const handleSaveOperations = () => {
    const operation = {
      date: formattedDate || 'N/A',
      inputData: { ...inputData },
      calculatedData: {
        totalBrl,
        usdtOperated,
        averageTicketUsdt,
        arsGenerated,
        grossIncome,
        netIncome,
        grossIncomeBrl,
        netIncomeBrl,
        grossIncomeUsdt,
        netIncomeUsdt,
        exchangeCommission,
        iofTax,
        sellerCommission,
        pixCostArs,
        totalVariableCosts,
        grossProfitPercentage: arsGenerated > 0 ? (grossIncome / arsGenerated) * 100 : 0,
        variableCostsPercentage: arsGenerated > 0 ? ((grossIncome - netIncome) / arsGenerated) * 100 : 0,
        netProfitPercentage: arsGenerated > 0 ? (netIncome / arsGenerated) * 100 : 0,
      },
    };
    setSavedOperations(prev => [...prev, operation]);
    alert('Operations saved successfully!');
  };

  // Function to toggle saved operations view
  const handleViewSavedOperations = () => {
    setShowSavedOperations(prev => !prev);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header with date selection */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Daily Summary</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="date" className="text-base text-gray-600">Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-base"
          />
        </div>
      </div>
      {formattedDate && (
        <p className="text-base text-gray-600">Selected Date: {formattedDate}</p>
      )}

      {/* Input Form */}
      <div className="bg-white rounded p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="ARS to Pay"
            name="arsToPay"
            type="number"
            value={inputData.arsToPay}
            onChange={handleInputChange}
            placeholder="Enter ARS"
          />
          <InputField
            label="USDT to Pay"
            name="usdtToPay"
            type="number"
            value={inputData.usdtToPay}
            onChange={handleInputChange}
            placeholder="Enter USDT"
          />
          <InputField
            label="USDT/BRL Rate"
            name="usdtBrlRate"
            type="number"
            value={inputData.usdtBrlRate}
            onChange={handleInputChange}
            placeholder="E.g., 5.80"
          />
          <InputField
            label="USDT/ARS Rate"
            name="usdtArsRate"
            type="number"
            value={inputData.usdtArsRate}
            onChange={handleInputChange}
            placeholder="E.g., 1141"
          />
          <InputField
            label="BRL Received"
            name="brlReceived"
            type="number"
            value={inputData.brlReceived}
            onChange={handleInputChange}
            placeholder="Enter BRL"
          />
          <InputField
            label="BRL from USDT"
            name="brlGeneratedFromUsdt"
            type="number"
            value={inputData.brlGeneratedFromUsdt}
            onChange={handleInputChange}
            placeholder="Enter BRL"
          />
          <InputField
            label="Number of Operations"
            name="numberOfOperations"
            type="number"
            value={inputData.numberOfOperations}
            onChange={handleInputChange}
            placeholder="Enter quantity"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleSaveOperations}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 focus:outline-none"
        >
          Save Operations
        </button>
        <button
          onClick={handleViewSavedOperations}
          className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 focus:outline-none"
        >
          {showSavedOperations ? 'Hide Saved Operations' : 'View Saved Operations'}
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 focus:outline-none"
        >
          Export CSV
        </button>
      </div>

      {/* Operations Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-blue-600">Total BRL Received</p>
          <p className="text-xl font-bold text-gray-800 mt-2">{formatter.format(totalBrl)}</p>
          <div className="mt-2 text-sm text-gray-600">
            <p>BRL Received: {formatter.format(brlIndividual)}</p>
            <p>BRL from USDT: {formatter.format(brlGeneratedFromUsdt)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-purple-600">USDT Operated</p>
          <p className="text-xl font-bold text-gray-800 mt-2">{formatter.format(usdtOperated)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-purple-600">Avg Ticket USDT</p>
          <p className="text-xl font-bold text-gray-800 mt-2">{formatter.format(averageTicketUsdt)}</p>
        </div>
      </div>

      {/* Financial Results */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-green-600">Gross Income</p>
          <div className="mt-2">
            <p className="text-xs text-gray-500">ARS</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(grossIncome)}</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">BRL</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(grossIncomeBrl)}</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">USDT</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(grossIncomeUsdt)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-green-600">Net Income</p>
          <div className="mt-2">
            <p className="text-xs text-gray-500">ARS</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(netIncome)}</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">BRL</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(netIncomeBrl)}</p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">USDT</p>
            <p className="text-lg font-bold text-gray-800">{formatter.format(netIncomeUsdt)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-sm font-semibold text-purple-600">Percentages</p>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Gross Profit</p>
            <p className="text-lg font-bold text-gray-800">
              {arsGenerated > 0 ? formatter.format((grossIncome / arsGenerated) * 100) : '0.00'}%
            </p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Variable Costs</p>
            <p className="text-lg font-bold text-gray-800">
              {arsGenerated > 0 ? formatter.format(((grossIncome - netIncome) / arsGenerated) * 100) : '0.00'}%
            </p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Net Profit</p>
            <p className="text-lg font-bold text-gray-800">
              {arsGenerated > 0 ? formatter.format((netIncome / arsGenerated) * 100) : '0.00'}%
            </p>
          </div>
        </div>
      </div>

      {/* Variable Costs */}
      <div className="bg-white rounded p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-2">Operational Variable Costs</p>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Exchange Commission (0.50%)</p>
            <p className="text-base font-medium text-gray-800">{formatter.format(exchangeCommission)} ARS</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">I.O.F Tax (0.38%)</p>
            <p className="text-base font-medium text-gray-800">{formatter.format(iofTax)} ARS</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Seller Commission (0.50%)</p>
            <p className="text-base font-medium text-gray-800">{formatter.format(sellerCommission)} ARS</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">PIX Cost (0.30 BRL/op)</p>
            <p className="text-base font-medium text-gray-800">{formatter.format(pixCostArs)} ARS</p>
          </div>
        </div>
      </div>

      {/* Saved Operations */}
      {showSavedOperations && (
        <div className="bg-white rounded p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Operations</h3>
          {savedOperations.length > 0 ? (
            savedOperations.map((operation, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <p className="text-base font-semibold text-gray-700">Operation {index + 1}</p>
                <p className="text-sm text-gray-600">Date: {operation.date}</p>
                <p className="text-sm text-gray-600">ARS to Pay: {operation.inputData.arsToPay}</p>
                <p className="text-sm text-gray-600">USDT to Pay: {operation.inputData.usdtToPay}</p>
                {/* Add more fields as needed */}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No saved operations.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
