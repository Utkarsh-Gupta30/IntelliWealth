import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import apiClient from '../api/client';

export const EMICalculatorPage = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [result, setResult] = useState(null);

  const calculate = async () => {
    try {
      const res = await apiClient.post('/calculator/loan-emi', {
        loan_amount: parseFloat(loanAmount),
        interest_rate: parseFloat(interestRate),
        tenure_months: parseInt(tenureYears) * 12
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    calculate();
  }, [loanAmount, interestRate, tenureYears]);

  const pieData = result ? [
    { name: 'Principal Amount', value: loanAmount, color: '#3B82F6' },
    { name: 'Total Interest', value: result.total_interest, color: '#F59E0B' }
  ] : [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">EMI & Loan Repayment Calculator</h2>
        <p className="text-xs text-slate-400 mt-1">Calculate monthly installments, total payable interest, and repayment amortization schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42] space-y-6">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" /> Loan Parameters
          </h3>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Loan Amount</span>
              <span className="font-bold text-white">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="10000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-blue-500 bg-[#0B0F17] h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Annual Interest Rate (%)</span>
              <span className="font-bold text-white">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="20.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-blue-500 bg-[#0B0F17] h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Tenure (Years)</span>
              <span className="font-bold text-white">{tenureYears} Years ({tenureYears * 12} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-blue-500 bg-[#0B0F17] h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Output Metrics & Pie Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-[#232D42] flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Monthly EMI</span>
              <span className="text-2xl font-bold font-display text-blue-400">₹{result?.monthly_emi?.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Interest Payable</span>
              <span className="text-2xl font-bold font-display text-amber-400">₹{result?.total_interest?.toLocaleString('en-IN')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Amount Payable</span>
              <span className="text-2xl font-bold font-display text-white">₹{result?.total_payment?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#151C2C', borderColor: '#232D42', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
        <h3 className="text-sm font-bold text-white font-display mb-4">Repayment Amortization Schedule (First 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232D42] text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Month</th>
                <th className="pb-3 font-semibold">Principal Paid</th>
                <th className="pb-3 font-semibold">Interest Paid</th>
                <th className="pb-3 font-semibold">Total Monthly Payment</th>
                <th className="pb-3 font-semibold text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D42]/60">
              {result?.schedule?.slice(0, 12).map((item) => (
                <tr key={item.month} className="hover:bg-[#151C2C]/50">
                  <td className="py-3 text-slate-300">Month {item.month}</td>
                  <td className="py-3 text-blue-400 font-medium">₹{item.principal_paid.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-amber-400 font-medium">₹{item.interest_paid.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-white">₹{item.total_payment.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-slate-400">₹{item.remaining_balance.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
