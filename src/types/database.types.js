/**
 * Database Type Definitions & Object Schemas for NTB Lab Portal
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {string} full_name
 * @property {string} role
 * @property {string} section
 * @property {number} active_tasks
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Sample
 * @property {string} id
 * @property {string} product
 * @property {string} [applicant]
 * @property {string} [sample_type]
 * @property {string} [date_received]
 * @property {string} [forwarded_on]
 * @property {string} [quantity]
 * @property {string} [standard]
 * @property {string} [required_tests]
 * @property {string[]} [documents]
 * @property {string} [remarks]
 * @property {string} [priority]
 * @property {string} [testing_section]
 * @property {string} [test_type]
 * @property {string} [assigned_engineer]
 * @property {string} [test_request_id]
 * @property {string} [allocation_date]
 * @property {string} [due_date]
 * @property {Object} [test_results]
 * @property {string} [test_date]
 * @property {string} [result_status]
 * @property {string} [verification_status]
 * @property {string} [report_number]
 * @property {string} [report_date]
 * @property {string} [reporting_manager]
 * @property {string} status
 * @property {string} type
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Clarification
 * @property {string} id
 * @property {string} sample_id
 * @property {string} product_name
 * @property {string} query
 * @property {string} date_raised
 * @property {string} status
 * @property {string} sent_to
 * @property {string} [response]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} UserManual
 * @property {number} id
 * @property {string} title
 * @property {string} updated_by
 * @property {string} date
 * @property {boolean} published
 * @property {string} [file_url]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} AuditLog
 * @property {number} id
 * @property {string} time
 * @property {string} text
 * @property {string} [user_id]
 * @property {string} [created_at]
 */

export {};
