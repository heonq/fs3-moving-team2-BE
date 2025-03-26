import { Request, Response } from 'express';
import QuotesService from '../service/moverQuotesService';

export default class QuotesController {
  constructor(private quoteService: QuotesService) {}

  getQuoteByIdForCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.userId ?? '';
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForCustomer(quoteId, userId);

    res.status(200).json(quote);
  };

  getQuoteByIdForMover = async (req: Request, res: Response) => {
    const moverId = req.user?.userId ?? '';
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForMover(quoteId, moverId);

    res.status(200).json(quote);
  };

  getQuotesListByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.userId ?? '';
    const { page, pageSize } = req.query;
    const numberedPage = page !== undefined ? Number(page) : 1;
    const numberedPageSize = pageSize !== undefined ? Number(pageSize) : 4;

    const data = await this.quoteService.getQuotesListByMover(
      numberedPage,
      numberedPageSize,
      moverId,
    );

    res.status(200).json(data);
  };

  submitQuoteByMover = async (req: Request, res: Response) => {
    const moverId = 'cm8o1uuc9005lwstst7rfd35s';
    const quoteId = req.body.quoteId;
    const price = req.body.price;
    const comment = req.body.comment;

    const quote = await this.quoteService.submitQuoteByMover(quoteId, moverId, price, comment);

    res.status(201).json(quote);
  };

  rejectQuoteByMover = async (req: Request, res: Response) => {
    const moverId = 'cm8p9c6sa005iwsm9fikr4asm';
    const quoteId = req.params.quoteId;
    const rejectionReason = req.body.rejectionReason;

    const rejectQuote = await this.quoteService.rejectQuoteByMover(
      quoteId,
      moverId,
      rejectionReason,
    );

    res.status(201).json(rejectQuote);
  };
}
