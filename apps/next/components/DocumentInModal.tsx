'use client'
import { Modal, useModal, useServerFunctions } from '@payloadcms/ui'
import type React from 'react'
import { useState } from 'react'

const slug = 'document-in-modal'

/**
 * Hosts an edit view in a plain `Modal` through the `render-document` server function, the way
 * `DocumentDrawer` does, with `drawerSlug` set to the modal's slug.
 */
export const DocumentInModal = () => {
	const { closeModal, openModal } = useModal()
	const { serverFunction } = useServerFunctions()
	const [doc, setDoc] = useState<React.ReactNode>(null)

	const open = async () => {
		openModal(slug)
		const result = (await serverFunction({
			name: 'render-document',
			args: {
				collectionSlug: 'posts',
				docID: (await (await fetch('/api/posts?limit=1')).json()).docs[0].id,
				drawerSlug: slug,
				redirectAfterCreate: false,
			},
		})) as { Document: React.ReactNode }
		setDoc(result.Document)
	}

	return (
		<div style={{ marginBottom: 24 }}>
			<button onClick={open} type="button">
				Open first post in a modal
			</button>
			<Modal slug={slug}>
				<div
					style={{
						background: 'var(--color-bg)',
						border: '2px solid var(--theme-success-500)',
						inset: '80px 15% 15%',
						overflow: 'auto',
						position: 'fixed',
					}}
				>
					<button
						onClick={() => {
							closeModal(slug)
							setDoc(null)
						}}
						style={{ margin: 16 }}
						type="button"
					>
						Close modal
					</button>
					{doc}
				</div>
			</Modal>
		</div>
	)
}
