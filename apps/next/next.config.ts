import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const config: NextConfig = {
	// Next 16.4 writes an AGENTS.md into the app on every dev start.
	agentRules: false,
	reactStrictMode: true,
}

export default withPayload(config, {
	devBundleServerPackages: false,
})
