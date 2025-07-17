'use client';

import { Property } from '../types/property.types';

interface Props {
  property: Property;
}

export default function PropertyPayment({ property }: Props) {
  const paymentPlan = property.payment_plan || '70/30';

  const renderPaymentPlan = () => {
    switch (paymentPlan) {
      case '60/40':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (60%)</h4>
              <ul className="space-y-3">
                {['10% on booking', '10% after 30 days', '10% after 60 days', '10% after 90 days', '10% after 120 days', '10% after 150 days'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-800 text-sm font-medium">{index + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (40%)</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
                  <p className="text-gray-800">Final payment upon handover</p>
                </div>
              </div>
            </div>
          </div>
        );
      case '50/50':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (50%)</h4>
              <ul className="space-y-3">
                {['10% on booking', '10% after 30 days', '10% after 60 days', '10% after 90 days', '10% after 120 days'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-800 text-sm font-medium">{index + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (50%)</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">50%</div>
                  <p className="text-gray-800">Final payment upon handover</p>
                </div>
              </div>
            </div>
          </div>
        );
      default: // 70/30
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">During Construction (70%)</h4>
              <ul className="space-y-3">
                {['10% on booking', '10% after 30 days', '10% after 60 days', '10% after 90 days', '10% after 120 days', '10% after 150 days', '10% after 180 days'].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <div className="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-800 text-sm font-medium">{index + 1}</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">On Completion (30%)</h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">30%</div>
                  <p className="text-gray-800">Final payment upon handover</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Plans</h2>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{paymentPlan} Payment Plan</h3>
          </div>

          <div className="mt-6">
            {renderPaymentPlan()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Payment Plan Information</h3>
          </div>
          <p className="text-gray-700 ml-10">
            For more details about our payment plans or to discuss custom payment options, please contact our sales team.
          </p>
        </div>
      </div>
    </div>
  );
}