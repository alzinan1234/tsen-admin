import ContentSubmissions from '@/components/ContentSubmissions'
import DashboardStats from '@/components/DashboardStats'
import ContentManagement from '@/components/admin/ContentManagement'
import PerformanceChart from '@/components/PerformanceChart'
import React from 'react'

const page = () => {
  return (
    <div>
      <DashboardStats />
      {/* <PerformanceChart />
      <ContentSubmissions />
      <ContentManagement /> */}

     <PerformanceChart />
    </div>
  )
}

export default page
