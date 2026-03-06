import React, { useState } from 'react';
import { BarChart2, TrendingUp, Package, Users } from 'lucide-react';
import AnalyticsOverview  from './AnalyticsOverview';
import AnalyticsSales     from './AnalyticsSales';
import AnalyticsProducts  from './AnalyticsProducts';
import AnalyticsCustomers from './AnalyticsCustomers';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: BarChart2,  component: AnalyticsOverview  },
  { id: 'sales',      label: 'Sales',      icon: TrendingUp, component: AnalyticsSales     },
  { id: 'products',   label: 'Products',   icon: Package,    component: AnalyticsProducts  },
  { id: 'customers',  label: 'Customers',  icon: Users,      component: AnalyticsCustomers },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 28,
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: 0,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}