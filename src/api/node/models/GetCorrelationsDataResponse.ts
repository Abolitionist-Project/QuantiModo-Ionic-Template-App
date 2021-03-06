/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Card } from './Card';
import type { Correlation } from './Correlation';
import type { Error } from './Error';
import type { Explanation } from './Explanation';

export type GetCorrelationsDataResponse = {
    correlations: Array<Correlation>;
    explanation: Explanation;
    /**
     * Can be used as body of help info popup
     */
    description?: string;
    /**
     * Can be used as title in help info popup
     */
    summary?: string;
    /**
     * Array of error objects with message property
     */
    errors?: Array<Error>;
    /**
     * ex. OK or ERROR
     */
    status?: string;
    /**
     * true or false
     */
    success?: boolean;
    /**
     * Response code such as 200
     */
    code?: number;
    /**
     * A super neat url you might want to share with your users!
     */
    link?: string;
    card?: Card;
}